import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import io from "socket.io-client";
import { Send, Phone, Video, MoreVertical, Sun, Moon } from "lucide-react";
import "../styles/Chatuser.css";
import API_URL from "../../config/api";

const socket = io(API_URL);

export default function ChatUser({ receiverId, receiverUsername, receiverProfilePic, isDarkMode: parentDarkMode }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { userId, getToken, user } = useAuth();

  useEffect(() => {
    setIsDarkMode(parentDarkMode);
  }, [parentDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.body.classList.toggle("dark-mode", newMode);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  useEffect(() => {
    if (!userId || !receiverId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        
        const response = await axios.get(`${API_URL}/getmessages`, {
          params: { with: receiverId },
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages(response.data.messages || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    inputRef.current?.focus();
  }, [receiverId, userId, getToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!userId || !receiverId) return;

    socket.emit("join", { userId });

    socket.on("receive_message", (data) => {
      if (data.senderId === receiverId) {
        setMessages((prev) => [...prev, {
          sender: data.senderId,
          username: receiverUsername,
          text: data.content,
          type: "text",
          timeStamp: data.timeStamp
        }]);
      }
    });

    socket.on("receive_meme", (data) => {
      if (data.senderId === receiverId) {
        setMessages((prev) => [...prev, {
          sender: data.senderId,
          username: receiverUsername,
          meme: data.meme,
          type: "meme",
          timeStamp: data.timeStamp
        }]);
      }
    });

    socket.on("typing", () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 3000);
    });

    socket.on("online_users", (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });

    return () => {
      socket.off("receive_message");
      socket.off("receive_meme");
      socket.off("typing");
      socket.off("online_users");
    };
  }, [receiverId, userId, receiverUsername]);

  const sendMessage = () => {
    if (!message.trim() || !userId || !receiverId) return;

    const data = {
      senderId: userId,
      receiverId,
      message: message.trim(),
    };

    socket.emit("send_message", data);
    
    setMessages((prev) => [...prev, {
      sender: userId,
      username: "You",
      text: message.trim(),
      type: "text",
      timeStamp: new Date()
    }]);
    
    setMessage("");
  };

  const handleTyping = () => {
    if (!receiverId || !userId) return;
    socket.emit("typing", { receiverId });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTyping();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOnline = receiverId && onlineUsers.includes(receiverId.toString());

  if (!receiverId) {
    return (
      <div className={`chatuser-container ${isDarkMode ? "dark-mode" : ""}`}>
        <div className="empty-chat">
          <div className="empty-icon">👥</div>
          <h4>Select a friend to chat</h4>
          <p>Choose someone from your friends list to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`chatuser-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="chatuser-header">
        <div className="friend-info">
          <div className="friend-avatar">
            <div className="avatar-circle">
              <span>{getInitials(receiverUsername)}</span>
            </div>
            <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
          </div>
          <div className="friend-details">
            <h3 className="friend-name">{receiverUsername}</h3>
            <p className={`friend-status ${isOnline ? 'status-online' : 'status-offline'}`}>
              {isOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn theme-btn" 
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="action-btn" title="Voice call">
            <Phone size={20} />
          </button>
          <button className="action-btn" title="Video call">
            <Video size={20} />
          </button>
          <button className="action-btn" title="More options">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-wrapper">
          {loading ? (
            <div className="loading-messages">
              <div className="loader-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-icon">💬</div>
              <h4>Start your conversation</h4>
              <p>Send a message to begin chatting with {receiverUsername}</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isYou = 
                msg.sender === userId || 
                String(msg.sender) === String(userId) ||
                msg.username === "You";
              
              const showTime =
                index === 0 ||
                new Date(msg.timeStamp).getTime() -
                  new Date(messages[index - 1]?.timeStamp).getTime() >
                  300000;

              return (
                <div key={index} className="message-group">
                  {showTime && (
                    <div className="time-separator">
                      <span>{formatTime(msg.timeStamp)}</span>
                    </div>
                  )}
                  
                  {msg.type === "meme" && msg.meme ? (
                    <div className={`message-row ${isYou ? "sent" : "received"}`}>
                      {!isYou && (
                        <div className="message-avatar">
                          <span>{getInitials(receiverUsername)}</span>
                        </div>
                      )}
                      <div className="message-bubble meme-message">
                        <div className="message-content">
                          <img 
                            src={msg.meme.imageurl || msg.meme.imageUrl} 
                            alt={msg.meme.title || "Meme"} 
                            className="meme-image"
                          />
                          {msg.meme.title && (
                            <p className="meme-title">{msg.meme.title}</p>
                          )}
                        </div>
                        <div className="message-meta">
                          <span className="message-time">
                            {formatTime(msg.timeStamp)}
                          </span>
                          {isYou && <span className="message-status">✓✓</span>}
                        </div>
                      </div>
                      {isYou && (
                        <div className="message-avatar sent">
                          <span>{getInitials(user?.username || user?.firstName || "You")}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`message-row ${isYou ? "sent" : "received"}`}>
                      {!isYou && (
                        <div className="message-avatar">
                          <span>{getInitials(receiverUsername)}</span>
                        </div>
                      )}
                      <div className="message-bubble text-message">
                        <div className="message-content">
                          <div className="message-text-wrapper">
                            {msg.text}
                          </div>
                        </div>
                        <div className="message-meta">
                          <span className="message-time">
                            {formatTime(msg.timeStamp)}
                          </span>
                          {isYou && <span className="message-status">✓✓</span>}
                        </div>
                      </div>
                      {isYou && (
                        <div className="message-avatar sent">
                          <span>{getInitials(user?.username || user?.firstName || "You")}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {typing && (
            <div className="message-row received">
              <div className="message-avatar">
                <span>{getInitials(receiverUsername)}</span>
              </div>
              <div className="message-bubble typing-bubble">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span>{receiverUsername} is typing</span>
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-area">
        <div className="input-container">
          <div className="message-input-wrapper">
            <textarea
              ref={inputRef}
              className="message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows="1"
              maxLength={1000}
            />
            <div className="input-actions">
              {message.trim() && (
                <span className="char-count">{message.length}/1000</span>
              )}
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!message.trim()}
                title="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="input-hint">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
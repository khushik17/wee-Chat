import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import io from "socket.io-client";
import { Send } from "lucide-react";
import "../styles/Chatuser.css";

const socket = io("http://localhost:3000");

export default function ChatUser({ receiverId, receiverUsername, isDarkMode }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { userId, getToken } = useAuth();

  // ✅ Fetch messages from backend
  useEffect(() => {
    if (!userId || !receiverId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        
        const response = await axios.get("http://localhost:3000/getmessages", {
          params: { with: receiverId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📥 Fetched messages:", response.data.messages);
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ✅ Socket listeners
  useEffect(() => {
    if (!userId || !receiverId) return;

    socket.emit("join", { userId });

    socket.on("receive_message", (data) => {
      console.log("📩 Received message:", data);
      if (data.senderId === receiverId) {
        setMessages((prev) => [...prev, {
          username: receiverUsername,
          text: data.content,
          type: "text",
          timeStamp: data.timeStamp
        }]);
      }
    });

    socket.on("receive_meme", (data) => {
      console.log("🖼️ Received meme:", data);
      if (data.senderId === receiverId) {
        setMessages((prev) => [...prev, {
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
    
    // Add to local messages immediately
    setMessages((prev) => [...prev, {
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
      {/* Messages Area */}
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
              // ✅ CRITICAL FIX: Proper sender detection
              const isYou = msg.username === "You";
              
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
                  
                  {/* ✅ MEME MESSAGE - FIXED */}
                  {msg.type === "meme" && msg.meme ? (
                    <div className={`message-row ${isYou ? "sent" : "received"}`}>
                      {!isYou && (
                        <div className="message-avatar">
                          <span>👤</span>
                        </div>
                      )}
                      <div className="message-bubble meme-message">
                        <img 
                          src={msg.meme.imageurl || msg.meme.imageUrl} 
                          alt={msg.meme.title || "Meme"} 
                          className="meme-image"
                          onError={(e) => {
                            console.error("❌ Meme load failed:", msg.meme);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<p style="color: red;">Failed to load meme</p>';
                          }}
                        />
                        {msg.meme.title && (
                          <p className="meme-title">{msg.meme.title}</p>
                        )}
                        <div className="message-meta">
                          <span className="message-time">
                            {formatTime(msg.timeStamp)}
                          </span>
                          {isYou && <span className="message-status">✓✓</span>}
                        </div>
                      </div>
                      {isYou && (
                        <div className="message-avatar sent">
                          <span>😊</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ✅ TEXT MESSAGE */
                    <div className={`message-row ${isYou ? "sent" : "received"}`}>
                      {!isYou && (
                        <div className="message-avatar">
                          <span>👤</span>
                        </div>
                      )}
                      <div className="message-bubble">
                        <div className="message-content">
                          <div className="message-header">
                            <span className="sender-name">{msg.username}</span>
                          </div>
                          <div className="message-text">{msg.text}</div>
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
                          <span>😊</span>
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
                <span>👤</span>
              </div>
              <div className="message-bubble typing-bubble">
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
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
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
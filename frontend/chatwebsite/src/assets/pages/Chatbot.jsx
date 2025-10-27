import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, Send, Bot, User, Loader } from "lucide-react";
import "../styles/Ai.css";
import API_URL from "../../config/api";

export default function ChatbotPage({ isDarkMode }) {
  return <Chatbot isDarkMode={isDarkMode} />;
}

function Chatbot({ isDarkMode }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { getToken } = useAuth();

  const CHAT_STORAGE_KEY = "chatbotMessages";

  useEffect(() => {
    const savedHistory = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Error loading chat history:", error);
        localStorage.removeItem(CHAT_STORAGE_KEY);
      }
    }

    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = { role: "user", content: message, timestamp: new Date() };
    setChatHistory((prev) => [...prev, userMsg]);
    setMessage("");
    setIsLoading(true);

    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const res = await axios.post(
        `${API_URL}/chat`,
        { message: userMsg.content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botMsg = {
        role: "ai",
        content: res.data.reply || "No response received",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error?.response?.data || error.message);
      
      let errorMessage = "Error occurred.";
      
      if (error.response) {
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.message.includes("Authentication")) {
        errorMessage = "Please login again to continue chatting.";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", content: errorMessage, timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    localStorage.setItem("darkMode", newMode.toString());
    window.location.reload();
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear all chat history?")) {
      setChatHistory([]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  return (
    <div className={`chatbot-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="chatbot-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => navigate("/memeFeed")}
            title="Back to Feed"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="ai-info">
            <div className="ai-avatar">
              <Bot size={24} />
            </div>
            <div className="ai-details">
              <h3>AI Assistant</h3>
              <span className="ai-status">
                {isLoading ? "Typing..." : "Online"}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="action-button"
            onClick={clearChat}
            title="Clear Chat"
            disabled={chatHistory.length === 0}
          >
            Clear
          </button>
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div className="chatbot-messages">
        {chatHistory.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-icon">
              <Bot size={48} />
            </div>
            <h4>Welcome to AI Chat!</h4>
            <p>I'm here to help you with any questions or conversations.</p>
            <div className="sample-questions">
              <div className="sample-title">Try asking me:</div>
              <button
                className="sample-question"
                onClick={() => setMessage("What can you help me with?")}
              >
                What can you help me with?
              </button>
              <button
                className="sample-question"
                onClick={() => setMessage("Tell me a joke")}
              >
                Tell me a joke
              </button>
              <button
                className="sample-question"
                onClick={() => setMessage("How are you today?")}
              >
                How are you today?
              </button>
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${
                  msg.role === "user" ? "user-message" : "ai-message"
                }`}
              >
                <div className="message-avatar">
                  {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">
                      {msg.role === "user" ? "You" : "AI Assistant"}
                    </span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="message-text">{msg.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message ai-message loading-message">
                <div className="message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">AI Assistant</span>
                  </div>
                  <div className="message-text">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-area">
        <form className="chatbot-input" onSubmit={handleChat}>
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              maxLength={1000}
            />
            <div className="input-actions">
              {message.trim() && (
                <span className="char-counter">{message.length}/1000</span>
              )}
              <button
                type="submit"
                className="send-button"
                disabled={!message.trim() || isLoading}
                title="Send message"
              >
                {isLoading ? <Loader size={20} className="spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </form>
        <div className="input-hint">Press Enter to send • Shift+Enter for new line</div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import "../styles/Ai.css";
export default function ChatbotPage() {
  return <Chatbot />;
}

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const navigate = useNavigate();

  const handleChat = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = { role: "user", content: message };
    setChatHistory((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:3000/chat",
        { message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const botMsg = { role: "ai", content: res.data.reply };
      setChatHistory((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", content: "Error occurred." },
      ]);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Top bar */}
      <div className="chatbot-header">
        <ArrowLeft
          size={30}
          onClick={() => navigate("/memeFeed")}
          style={{ cursor: "pointer" }}
        />
        <h3>AI Chat</h3>
      </div>

      {/* Messages */}
      <div className="chatbot-messages">
        {chatHistory.map((msg, idx) => (
          <p key={idx} style={{ color: msg.role === "user" ? "white" : "#0f0" }}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
          </p>
        ))}
      </div>

      {/* Input bar */}
      <form className="chatbot-input" onSubmit={handleChat}>
        <input
          type="text"
          placeholder="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">
          <Send size={24} />
        </button>
      </form>
    </div>
  );
}

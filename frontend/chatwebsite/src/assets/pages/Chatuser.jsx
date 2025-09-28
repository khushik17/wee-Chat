import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import io from "socket.io-client";
import "../styles/Chatuser.css";
const socket = io("http://localhost:3000");

export default function ChatUser({ receiverId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);

  const token = localStorage.getItem("token");
  const userId = jwtDecode(token).id; console.log("Joining with userId:", userId);
  


  useEffect(() => {
    socket.emit("join", { userId });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing", () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 3000);
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
    };
  }, [receiverId]);

  useEffect(() => {
  socket.on("online_users", (onlineUserIds) => {
    console.log("Online users:", onlineUserIds);
    setOnlineUsers(onlineUserIds); 
  });

  return () => {
    socket.off("online_users");
  };
}, []);


  const sendMessage = () => {
    if (!message.trim()) return;
    const data = { senderId: userId, receiverId, message };
    socket.emit("send_message", data);
    setMessages((prev) => [...prev, data]);
    setMessage("");
  };

  const handleTyping = () => {
    socket.emit("typing", { receiverId });
  };
return (
  <div className="outer">

    <div className="Online">
      {onlineUsers.includes(receiverId.toString()) ? (
        <span style={{ color: "lightgreen" }}>🟢 Friend is online</span>
      ) : (
        <span style={{ color: "gray" }}>⚪ Friend is offline</span>
      )}
    </div>

    <div className="Bahar"
      style={{
        height: "70vh",
        overflowY: "scroll",
        border: "1px solid grey",
        boxShadow: "2px 0px 3px rgba(143, 138, 138, 0.1)",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {messages.map((msg, index) => {
        const isYou = msg.senderId === userId;
        return (
          <div className="Mesg"
            key={index}
            style={{
              display: "flex",
              justifyContent: isYou ? "flex-end" : "flex-start",
            }}
          >
            <div className="Text"
              style={{
                backgroundColor: isYou ? "#726EFF" : "#2E2E2E",
                color: "white",
                padding: "10px 14px",
                borderRadius: isYou
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
                maxWidth: "70%",
                fontSize: "14px",
                wordBreak: "break-word",
              }}
            >
              <b>{isYou ? "You" : "Friend"}:</b> {msg.message}
            </div>
          </div>
        );
      })}
      {typing && <div style={{ color: "gray", marginTop: "10px" }}>Friend is typing...</div>}
      
    </div>
    <div className="Box">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleTyping}
        placeholder="Type..."
      />
      <button
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  </div>
);

};
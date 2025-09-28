import { useNavigate } from "react-router-dom";
import "../styles/Chat.css";
import ChatUser from "./Chatuser";
import ChatbotPage from "./Chatbot";
import { AiOutlineArrowLeft } from "react-icons/ai";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ChatLanding() {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("");
  const [username, setUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("selectedUser");
    const aiMode = localStorage.getItem("showChatbot");

    if (storedUser) {
      setSelectedUser(JSON.parse(storedUser));
    } else if (aiMode === "true") {
      setShowChatbot(true);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfilePic(res.data.user.profilePicture);
        setUsername(res.data.user.username);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/chat-search", {
          params: { q: searchQuery },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSearchResults(response.data.users || []);
      } catch (err) {
        console.error("Failed to fetch results", err);
      }
    };

    if (searchQuery.trim() !== "") {
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const openChatWithUser = (user) => {
    setSelectedUser(user);
    localStorage.setItem("selectedUser", JSON.stringify(user));
    localStorage.removeItem("showChatbot");

    setRecentChats((prevChats) => {
      const alreadyExists = prevChats.find((chat) => chat._id === user._id);
      if (alreadyExists) return prevChats;
      return [...prevChats, user];
    });

    setShowChatbot(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const toggleChatbot = () => {
    const newState = !showChatbot;
    setShowChatbot(newState);
    setSelectedUser(null);

    if (newState) {
      localStorage.setItem("showChatbot", "true");
      localStorage.removeItem("selectedUser");
    } else {
      localStorage.removeItem("showChatbot");
    }
  };

 return (
  <div className="Container">
    {/* LEFT PANEL */}
    <div className="left">
      <div className="Top">
        <div className="TopRow">
          <AiOutlineArrowLeft
            className="BackArrow"
            onClick={() => {
              localStorage.removeItem("selectedUser");
              localStorage.removeItem("showChatbot");
              navigate("/memeFeed");
            }}
          />
          <div className="ProfileInfo">
            <img
              src={`http://localhost:3000${profilePic}`}
              alt="Profile"
              className="ProfilePic"
            />
            <div className="Username">{username}</div>
          </div>
        </div>

        {/* Search + AI toggle */}
        <div className="ai-chat-input-wrapper">
          <div className="ai-chat-input-container">
            <div className="ai-icon" onClick={toggleChatbot}>🤖</div>
            <input
              type="text"
              placeholder="Chat with AI or Search users"
              className="ai-chat-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="search-result-item"
                  onClick={() => openChatWithUser(user)}
                >
                  {user.username}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Chats */}
      <div className="Bottom">
        <h3>Recent Chats:</h3>
        {recentChats.map((chatUser) => (
          <div key={chatUser._id}>{chatUser.username}</div>
        ))}
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="right">
      {showChatbot && <ChatbotPage />}
      {selectedUser && (
        <div className="user-chat-window">
          <h2>Chatting with {selectedUser.username}</h2>
          <ChatUser receiverId={selectedUser._id} />
        </div>
      )}
    </div>
  </div>
);
}
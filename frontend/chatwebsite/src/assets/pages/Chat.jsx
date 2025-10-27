import { useNavigate } from "react-router-dom";
import "../styles/Chat.css";
import ChatUser from "./Chatuser";
import ChatbotPage from "./Chatbot";
import { AiOutlineArrowLeft } from "react-icons/ai";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";

export default function ChatLanding() {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  const [profilePic, setProfilePic] = useState("");
  const [username, setUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  useEffect(() => {
    const originalStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = originalStyle.overflow;
      document.body.style.position = originalStyle.position;
      document.body.style.width = originalStyle.width;
      document.body.style.height = originalStyle.height;
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/login");
    }
  }, [isSignedIn, navigate]);

  useEffect(() => {
    const storedUser = localStorage.getItem("selectedUser");
    const aiMode = localStorage.getItem("showChatbot");
    const darkMode = localStorage.getItem("darkMode") === "true";

    if (storedUser) setSelectedUser(JSON.parse(storedUser));
    else if (aiMode === "true") setShowChatbot(true);

    setIsDarkMode(darkMode);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await axios.get("http://localhost:3000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfilePic(res.data.user.profilePicture);
        setUsername(res.data.user.username);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    if (isSignedIn) fetchProfile();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await axios.get("http://localhost:3000/recent-chats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRecentChats(response.data.recent || []);
      } catch (err) {
        console.error("Failed to fetch recent chats", err);
      }
    };

    if (isSignedIn) fetchRecentChats();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const token = await getToken();
        if (!token) return;

        const response = await axios.get("http://localhost:3000/chat-search", {
          params: { q: searchQuery },
          headers: { Authorization: `Bearer ${token}` },
        });

        setSearchResults(response.data.users || []);
      } catch (err) {
        console.error("Failed to fetch search results", err);
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, getToken, isSignedIn]);

  const openChatWithUser = (user) => {
    const normalizedUser = {
      userId: user.clerkId || user.userId,
      username: user.username,
      profilePicture: user.profilePicture,
      email: user.email,
    };

    setSelectedUser(normalizedUser);
    localStorage.setItem("selectedUser", JSON.stringify(normalizedUser));
    localStorage.removeItem("showChatbot");

    setRecentChats((prevChats) => {
      const alreadyExists = prevChats.find((chat) => chat.userId === normalizedUser.userId);
      if (alreadyExists) return prevChats;
      return [...prevChats, normalizedUser];
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

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  const clearCurrentChat = () => {
    setSelectedUser(null);
    setShowChatbot(false);
    localStorage.removeItem("selectedUser");
    localStorage.removeItem("showChatbot");
  };

  // ✅ NEW: Function to go back to sidebar (for mobile)
  const handleBackToSidebar = () => {
    setSelectedUser(null);
    setShowChatbot(false);
    localStorage.removeItem("selectedUser");
    localStorage.removeItem("showChatbot");
  };

  return (
    <div className={`chat-container ${isDarkMode ? "dark-mode" : ""} ${(selectedUser || showChatbot) ? "chat-active" : ""}`}>
      {/* LEFT SIDEBAR */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="header-top">
            <div className="user-info-section">
              <AiOutlineArrowLeft
                className="back-arrow"
                style={{ fontSize: "28px", cursor: "pointer" }}
                onClick={() => {
                  localStorage.removeItem("selectedUser");
                  localStorage.removeItem("showChatbot");
                  navigate("/memeFeed");
                }}
                title="Back to Feed"
              />
              <div className="current-user-info">
                {profilePic ? (
                  <img
                    src={`http://localhost:3000${profilePic}`}
                    alt="Profile"
                    className="user-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="user-avatar-fallback"
                  style={{
                    display: profilePic ? 'none' : 'flex',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}
                >
                  {getInitials(username || user?.username)}
                </div>
                <div className="user-details">
                  <div className="username">{username || user?.username || "Loading..."}</div>
                  <div className="user-status">Active now</div>
                </div>
              </div>
            </div>

            <div className="header-controls">
              <button
                className="theme-toggle"
                onClick={toggleDarkMode}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          <div className="search-container">
            <div className="search-input-wrapper">
              <div
                className={`ai-toggle ${showChatbot ? "active" : ""}`}
                onClick={toggleChatbot}
                title="Toggle AI Chat"
              >
                🤖
              </div>
              <input
                type="text"
                placeholder="Chat with AI or Search users..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {(selectedUser || showChatbot) && (
                <button className="clear-chat" onClick={clearCurrentChat} title="Close current chat">
                  ✕
                </button>
              )}
            </div>

            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="search-results-dropdown">
                <div className="search-results-header">
                  <span>Users ({searchResults.length})</span>
                </div>
                {searchResults.map((user) => (
                  <div
                    key={user.clerkId || user.userId}
                    className="search-result-item"
                    onClick={() => openChatWithUser(user)}
                  >
                    {user.profilePicture ? (
                      <img
                        src={`http://localhost:3000${user.profilePicture}`}
                        alt={user.username}
                        className="result-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="result-avatar-fallback"
                      style={{
                        display: user.profilePicture ? 'none' : 'flex',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px',
                        flexShrink: 0
                      }}
                    >
                      {getInitials(user.username)}
                    </div>
                    <div className="result-info">
                      <div className="result-username">{user.username}</div>
                      <div className="result-email">{user.email || "User"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="search-results-dropdown">
                <div className="search-no-results">
                  <span>No users found</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-content">
          <div className="recent-chats-section">
            <h3 className="section-title">Recent Chats</h3>
            <div className="chats-list">
              {recentChats.length > 0 ? (
                recentChats.map((chatUser, index) => {
                  if (!chatUser.username || chatUser.username.trim() === '') return null;
                  
                  return (
                    <div
                      key={chatUser.userId || index}
                      className={`chat-item ${selectedUser?.userId === chatUser.userId ? "active" : ""}`}
                      onClick={() => openChatWithUser(chatUser)}
                    >
                      {chatUser.profilePicture ? (
                        <img
                          src={`http://localhost:3000${chatUser.profilePicture}`}
                          alt={chatUser.username}
                          className="chat-avatar"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="chat-avatar-fallback"
                        style={{
                          display: chatUser.profilePicture ? 'none' : 'flex',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '14px',
                          flexShrink: 0
                        }}
                      >
                        {getInitials(chatUser.username)}
                      </div>
                      <div className="chat-info">
                        <div className="chat-username">{chatUser.username}</div>
                        <div className="chat-preview">
                          {chatUser.messages?.[chatUser.messages.length - 1]?.content || "Click to chat"}
                        </div>
                      </div>
                      <div className="chat-time">
                        <div className="online-indicator"></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <p>No recent chats</p>
                  <small>Search for users to start chatting</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="chat-main">
        {!showChatbot && !selectedUser && (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-icon">🗨️</div>
              <h2>Welcome to Chat</h2>
              <div className="welcome-options">
                <div className="welcome-option">
                  <div className="option-icon">🤖</div>
                  <div>
                    <h4>Chat with AI</h4>
                    <p>Click the robot icon to start an AI conversation</p>
                  </div>
                </div>
                <div className="welcome-option">
                  <div className="option-icon">🔍</div>
                  <div>
                    <h4>Find Users</h4>
                    <p>Search for users to start a new conversation</p>
                  </div>
                </div>
                <div className="welcome-option">
                  <div className="option-icon">📱</div>
                  <div>
                    <h4>Recent Chats</h4>
                    <p>Continue your previous conversations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showChatbot && (
          <ChatbotPage isDarkMode={isDarkMode} onBack={handleBackToSidebar} />
        )}

        {selectedUser && (
          <ChatUser
            receiverId={selectedUser.userId}
            receiverUsername={selectedUser.username}
            receiverProfilePic={selectedUser.profilePicture}
            isDarkMode={isDarkMode}
            onBack={handleBackToSidebar}
          />
        )}
      </div>
    </div>
  );
}
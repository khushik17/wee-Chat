import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Sun, Moon, MessageCircle, Home, User } from "lucide-react"; // ✅ LogOut remove
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedMode);
    document.body.classList.toggle("dark-mode", savedMode);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.body.classList.toggle("dark-mode", newMode);
    window.dispatchEvent(new CustomEvent("themeChange", { detail: { isDarkMode: newMode } }));
  };

  const handleRefreshMemes = () => {
    window.dispatchEvent(new CustomEvent("refreshMemes"));
    navigate("/memeFeed");
  };

  // ✅ handleLogout function removed completely

  if (!isLoaded) return null;

  return (
    <>
      <nav className={`vertical-sidebar ${isDarkMode ? "dark" : ""}`}>
        <div className="sidebar-logo-spacer"></div>

        <div className="sidebar-links">
          <button 
            className="sidebar-link"
            onClick={handleRefreshMemes}
            title="Refresh Memes"
          >
            <Home size={24} />
          </button>
          
          <button 
            className="sidebar-link"
            onClick={() => navigate("/chat")}
            title="Chat"
          >
            <MessageCircle size={24} />
          </button>

          <button 
            className="sidebar-link"
            onClick={toggleDarkMode}
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        <div className="sidebar-user">
          {user && (
            <div className="user-profile-wrapper">
              <img 
                src={user.imageUrl || "https://via.placeholder.com/40"}
                alt={user.username || "User"}
                className="sidebar-user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
              />
              
              {/* ✅ User Dropdown - Only Profile option */}
              {showUserMenu && (
                <div className="sidebar-user-menu">
                  <div className="menu-item" onClick={() => { navigate("/profile"); setShowUserMenu(false); }}>
                    <User size={16} />
                    <span>Profile</span>
                  </div>
                  {/* ✅ Logout option REMOVED */}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className={`mobile-bottom-nav ${isDarkMode ? "dark" : ""}`}>
        <button 
          className="mobile-nav-item"
          onClick={handleRefreshMemes}
        >
          <Home size={24} />
          <span>Home</span>
        </button>
        
        <button 
          className="mobile-nav-item"
          onClick={() => navigate("/chat")}
        >
          <MessageCircle size={24} />
          <span>Chat</span>
        </button>
        
        <button 
          className="mobile-nav-item"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          <span>Theme</span>
        </button>
        
        <button 
          className="mobile-nav-item"
          onClick={() => navigate("/profile")}
        >
          <User size={24} />
          <span>Profile</span>
        </button>
      </div>
    </>
  );
}
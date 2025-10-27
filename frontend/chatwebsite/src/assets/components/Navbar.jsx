import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Sun, Moon, MessageCircle, Home, User, LogOut } from "lucide-react";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Load dark mode preference
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
    
    // ✅ Trigger event for meme cards AND memefeed background
    window.dispatchEvent(new CustomEvent("themeChange", { detail: { isDarkMode: newMode } }));
  };

  // ✅ Refresh memes function
  const handleRefreshMemes = () => {
    window.dispatchEvent(new CustomEvent("refreshMemes"));
    navigate("/memeFeed");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (!isLoaded) return null;

  return (
    <>
      {/* ✅ VERTICAL SIDEBAR - NO LOGO */}
      <nav className={`vertical-sidebar ${isDarkMode ? "dark" : ""}`}>
        {/* ✅ NO LOGO - Empty div for spacing */}
        <div className="sidebar-logo-spacer"></div>

        {/* Navigation Links */}
        <div className="sidebar-links">
          {/* ✅ Home button with refresh functionality */}
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

        {/* User Profile */}
        <div className="sidebar-user">
          {user && (
            <div className="user-profile-wrapper">
              <img 
                src={user.imageUrl || "https://via.placeholder.com/40"}
                alt={user.username || "User"}
                className="sidebar-user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
              />
              
              {/* User Dropdown */}
              {showUserMenu && (
                <div className="sidebar-user-menu">
                  <div className="menu-item" onClick={() => { navigate("/profile"); setShowUserMenu(false); }}>
                    <User size={16} />
                    <span>Profile</span>
                  </div>
                  <div className="menu-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ✅ MOBILE BOTTOM NAV */}
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
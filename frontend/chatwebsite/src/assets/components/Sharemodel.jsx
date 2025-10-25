import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react"; // ✅ Clerk hook
import "../styles/ShareModel.css";

export default function ShareModal({ meme, onClose, onSend }) {
  const { getToken } = useAuth(); // ✅ Clerk token
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const token = await getToken(); // ✅ Clerk token
        const res = await axios.get("http://localhost:3000/chat-search", {
          params: { q: searchQuery },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(res.data.users || []);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      }
    };

    // ✅ Debounce search
    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, getToken]);

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h2>Share Meme</h2>
        <img src={meme.imageUrl} alt={meme.title} className="modal-meme" />
        <input
          type="text"
          placeholder="Search users by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="modal-search-input"
        />
        
        {/* ✅ Search Results */}
        {searchResults.length > 0 && (
          <ul className="modal-results">
            {searchResults.map((user) => (
              <li
                key={user.clerkId} // ✅ clerkId use karo
                onClick={() => onSend(user.clerkId)} // ✅ clerkId bhejo
                className="modal-result-item"
              >
                <span className="user-avatar">👤</span>
                <span className="user-name">{user.username}</span>
              </li>
            ))}
          </ul>
        )}
        
        {/* ✅ No results message */}
        {searchQuery.trim() && searchResults.length === 0 && (
          <div className="modal-no-results">
            <p>No users found</p>
          </div>
        )}

        <button onClick={onClose} className="modal-close-btn">
          Close
        </button>
      </div>
    </div>
  );
}
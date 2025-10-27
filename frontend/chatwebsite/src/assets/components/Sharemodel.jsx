import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import "../styles/ShareModel.css";
import API_URL from "../../config/api";

export default function ShareModal({ meme, onClose, onSend }) {
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const token = await getToken();
        const res = await axios.get(`${API_URL}/chat-search`, {
          params: { q: searchQuery },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(res.data.users || []);
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, getToken]);

  const handleSendToUser = async (receiverId) => {
    if (sending) return;
    
    setSending(true);
    try {
      await onSend(receiverId);
      onClose();
    } catch (err) {
      console.error("Failed to send meme:", err);
      alert("Failed to send meme. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h2>Share Meme</h2>
        <img src={meme.imageUrl} alt={meme.title} className="modal-meme" />
        <input
          type="text"
          placeholder="Search users by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="modal-search-input"
          disabled={sending}
        />
        
        {searchResults.length > 0 && (
          <ul className="modal-results">
            {searchResults.map((user) => (
              <li
                key={user.clerkId}
                onClick={() => handleSendToUser(user.clerkId)}
                className={`modal-result-item ${sending ? "disabled" : ""}`}
              >
                <span className="user-avatar">👤</span>
                <span className="user-name">{user.username}</span>
                {sending && <span className="sending-indicator">Sending...</span>}
              </li>
            ))}
          </ul>
        )}
        
        {searchQuery.trim() && searchResults.length === 0 && (
          <div className="modal-no-results">
            <p>No users found</p>
          </div>
        )}

        <button onClick={onClose} className="modal-close-btn" disabled={sending}>
          Close
        </button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import "../styles/CommentModal.css";

export default function CommentModal({ meme, onClose, onComment }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setComments(meme.comments || []);
  }, [meme._id]);

  const getAuthConfig = async () => {
    const token = await getToken();
    return {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    };
  };

  const handlePost = async () => {
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const config = await getAuthConfig();
      
      const res = await axios.post(
        `http://localhost:3000/comment`,
        { 
          id: meme._id,
          text: commentText.trim() 
        },
        config
      );

      const updatedComments = res.data.meme?.comments || [];
      
      setComments(updatedComments);
      onComment(updatedComments);
      setCommentText("");
      
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div
        className="comment-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="comment-modal-left">
          <img src={meme.imageUrl} alt={meme.title} />
        </div>

        <div className="comment-modal-right">
          <h3 style={{ color: "#000" }}>{meme.title}</h3>

          <div className="comment-modal-list">
            {comments.length === 0 ? (
              <p style={{ color: "#666", padding: "20px", textAlign: "center" }}>
                No comments yet. Be the first to comment! 💬
              </p>
            ) : (
              comments.map((c, i) => (
                <div
                  key={c._id || i}
                  className="comment-modal-item"
                  style={{ color: "#000" }}
                >
                  <strong>
                    {c.username || c.user?.username || "User"}:
                  </strong>{" "}
                  {c.text}
                </div>
              ))
            )}
          </div>

          <div className="comment-modal-input">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handlePost()}
              disabled={loading}
              style={{ color: "#000" }}
            />
            <button 
              onClick={handlePost} 
              disabled={loading || !commentText.trim()}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>

          {/* ✅ Red close button */}
          <button className="comment-modal-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
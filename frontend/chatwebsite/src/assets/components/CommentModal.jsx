import React, { useState, useEffect } from "react";
import "../styles/CommentModal.css";

export default function CommentModal({ meme, onClose, onComment }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    setComments(meme.comments || []);
  }, [meme.comments]);

  const handlePost = () => {
    if (!commentText.trim()) return;

    const newComment = { username: "You", text: commentText };
    const newComments = [...comments, newComment];

    setComments(newComments);
    onComment(newComments); // parent update
    setCommentText("");
  };

  return (
    <div className="comment-modal-overlay">
      <div className="comment-modal-container">
        {/* LEFT: Meme Image */}
        <div className="comment-modal-left">
          <img src={meme.imageUrl} alt={meme.title} />
        </div>

        {/* RIGHT: Comments Section */}
        <div className="comment-modal-right">
          <h3 style={{ color: "#000" }}>{meme.title}</h3>

          <div className="comment-modal-list">
            {comments.map((c, i) => (
              <div
                key={i}
                className="comment-modal-item"
                style={{ color: "#000" }}
              >
                <strong>{c.username || "User"}:</strong> {c.text}
              </div>
            ))}
          </div>

          <div className="comment-modal-input">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePost()}
              style={{ color: "#000" }}
            />
            <button onClick={handlePost}>Post</button>
          </div>

          <button className="comment-modal-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

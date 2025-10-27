import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment, FaShare } from "react-icons/fa";
import { useUser } from "@clerk/clerk-react";
import "../styles/Chatmeme.css";

export default function MemeCard({ meme, onShare, onComment, onLikeToggle }) {
  const { user } = useUser();
  const [showHeart, setShowHeart] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ✅ Listen for theme changes
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedMode);

    const handleThemeChange = (e) => {
      setIsDarkMode(e.detail.isDarkMode);
    };

    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const likes = meme.like?.length || 0;
  const liked = user && Array.isArray(meme.like) 
    ? meme.like.some((uid) => uid?.toString() === user.id?.toString())
    : false;

  // ✅ Double-click to like with heart animation
  const handleDoubleClick = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please sign in to like memes!");
      return;
    }

    if (!liked) {
      // Show heart animation only when liking
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }

    if (onLikeToggle) {
      await onLikeToggle(meme._id);
    }
  };

  // ✅ Button click to toggle like with heart animation
  const handleButtonClick = async () => {
    if (!user) {
      alert("Please sign in to like memes!");
      return;
    }

    // ✅ Show heart animation when liking via button
    if (!liked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }

    if (onLikeToggle) {
      await onLikeToggle(meme._id);
    }
  };

  return (
    <div className={`meme-card-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div 
        className="meme-image-wrapper" 
        onDoubleClick={handleDoubleClick}
      >
        <img 
          src={meme.imageUrl} 
          alt={meme.title} 
          className="meme-image"
          draggable="false"
        />

        {/* ✅ Heart animation on like */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              className="big-heart"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AiFillHeart color="red" size={120} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="meme-action-bar">
        <button 
          onClick={handleButtonClick}
          className="like-button" 
          title={liked ? "Unlike" : "Like"}
        >
          {liked ? (
            <AiFillHeart className="liked-icon" color="red" size={24} />
          ) : (
            <AiOutlineHeart size={24} />
          )}
        </button>

        <button onClick={onComment} className="comment-button" title="Comment">
          <FaRegComment size={22} />
        </button>

        <button onClick={onShare} className="share-button" title="Share">
          <FaShare size={20} />
        </button>
      </div>

      <p className="meme-title">{meme.title}</p>
      <p className="meme-likes">
        {likes} {likes === 1 ? "like" : "likes"}
      </p>

      {meme.comments && meme.comments.length > 0 && (
        <div className="meme-top-comments">
          {meme.comments.slice(-2).map((c, i) => (
            <p key={i} className="comment-text">
              <strong>{c.user?.username || "User"}:</strong> {c.text}
            </p>
          ))}
          {meme.comments.length > 2 && (
            <button onClick={onComment} className="view-all-comments">
              View all {meme.comments.length} comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}
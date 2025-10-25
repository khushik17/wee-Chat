import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment, FaShare } from "react-icons/fa";
import { useUser } from "@clerk/clerk-react";
import "../styles/Chatmeme.css";

export default function MemeCard({ meme, onShare, onComment, onLikeToggle }) {
  const { user } = useUser();
  const [showHeart, setShowHeart] = useState(false);

  // ✅ Use meme prop directly
  const likes = meme.like?.length || 0;
  const liked = user && Array.isArray(meme.like) 
    ? meme.like.some((uid) => uid?.toString() === user.id)
    : false;

  // ❤ Handle double-click with animation
  const handleDoubleClick = async (e) => {
    e.preventDefault();
    console.log("🔥 Double click detected!");
  console.log("User:", user);
  console.log("Liked:", liked);

    if (!user) {
      alert("Please sign in to like memes!");
      return;
    }

    // Show animation only when liking (not unliking)
    if (!liked) {
      console.log("❤️ Setting showHeart to TRUE");
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }

    // Call parent's like toggle
    if (onLikeToggle) {
      await onLikeToggle(meme._id);
    }
  };

  // 🔘 Handle button click (no animation)
  const handleButtonClick = async () => {
    if (!user) {
      alert("Please sign in to like memes!");
      return;
    }

    // Just toggle, no animation
    if (onLikeToggle) {
      await onLikeToggle(meme._id);
    }
  };

  return (
    <div className="meme-card-container">
      {/* ✅ Double-click for animation */}
      <div 
        className="meme-image-wrapper" 
        onDoubleClick={handleDoubleClick}
        style={{ position: "relative" }}
      >
        <img 
          src={meme.imageUrl} 
          alt={meme.title} 
          className="meme-image"
          draggable="false"
        />

        {/* ❤ Popup Heart Animation */}
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
        {/* ✅ Button click without animation */}
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

      {/* ✅ Show last 2 comments */}
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
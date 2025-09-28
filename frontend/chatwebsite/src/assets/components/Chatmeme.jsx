import { useState, useEffect } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment, FaShare } from "react-icons/fa";
import axios from "axios";
import "../styles/Chatmeme.css";

export default function MemeCard({ meme }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [likes, setLikes] = useState(
    Array.isArray(meme.like) ? meme.like.length : 0
  );
  const currentUserId = localStorage.getItem("userId");
  const [liked, setLiked] = useState(
    Array.isArray(meme.like)
      ? meme.like.some((uid) => uid.toString() === currentUserId)
      : false
  );
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [comments, setComments] = useState(
    Array.isArray(meme?.comments) ? meme.comments : []
  );

  // 🔎 Fetch search results
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

  // ❤️ Like handler
  const handleLike = async () => {
    try {
      const endpoint = liked ? "/unlike" : "/like";
      const res = await axios.post(
        endpoint,
        { id: meme._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setLikes(res.data.likes);
      setLiked(res.data.liked);
    } catch (err) {
      console.error("Error liking/unliking meme", err);
    }
  };

  // 📤 Toggle share form
  const handleEditToggle = () => {
    setShowForm(!showForm);
  };


  const handleSend = async (receiverId) => {
    console.log("Sending meme:", { memeid: meme._id, receiverId });
    try {
      await axios.post(
        "http://localhost:3000/send",
        { memeid: meme._id, receiverId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Meme sent successfully!");
      setShowForm(false); // close after sending
      setSearchQuery(""); // reset search
      setSearchResults([]);
    } catch (error) {
      console.error("Sending meme failed", error);
      alert("Sending failed");
    }
  };

 
  const handleComment = async () => {
    if (!comment.trim()) return;

    console.log("meme._id:", meme._id, "typeof:", typeof meme._id);
    console.log("Sending comment:", { id: meme._id, text: comment });

    try {
      const res = await axios.post("/comment", {
        id: meme._id,
        text: comment,
      });
      setComments(res.data.meme.comments);
      setComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  return (
    <div className="meme-card-container">
      <img src={meme.imageUrl} alt={meme.title} />

     
      <div className="meme-action-bar">
        <button onClick={handleLike} className="like-button">
          {liked ? (
            <AiFillHeart className="liked-icon" />
          ) : (
            <AiOutlineHeart className="unliked-icon" />
          )}
        </button>

        <button
          onClick={() => setCommentOpen(!commentOpen)}
          className="comment-button"
        >
          <FaRegComment />
        </button>

        <button onClick={handleEditToggle} className="share-button">
          <FaShare />
        </button>
      </div>

     
      {showForm && (
        <div className="share-form">
          <input
            type="text"
            placeholder="Search users"
            className="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <ul className="results-dropdown">
              {searchResults.map((user) => (
                <li
                  key={user._id}
                  onClick={() => handleSend(user._id)}
                  className="result-item"
                >
                  {user.username}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="meme-title">{meme.title}</p>
      <p className="meme-likes">{likes} likes</p>

      {/* Comments toggle */}
      {commentOpen && (
        <>
          <div className="comment-box">
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="comment-input"
            />
            <button onClick={handleComment} className="comment-submit-button">
              Post
            </button>
          </div>

          <div className="comments-list">
            {comments && comments.length > 0 ? (
              comments.map((c, i) => (
                <div key={i} className="comment-item">
                  {c.text}
                </div>
              ))
            ) : (
              <div className="no-comments">No comments yet</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import Masonry from "react-masonry-css";
import MemeCard from "../components/Chatmeme";
import ShareModal from "../components/Sharemodel";
import CommentModal from "../components/CommentModal";
import socket from "../../socket";
import { useUser, useAuth } from "@clerk/clerk-react";

import "../styles/MemeFeed.css";

export default function MemeFeed() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [memes, setMemes] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [modalMeme, setModalMeme] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentMeme, setCommentMeme] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const seen = useRef(new Set());
  const breakpointColumnsObj = { default: 3, 1100: 2, 700: 1 };

  useEffect(() => {
    if (!isLoaded || !user) return;

    fetchMemes();
    socket.emit("join", { userId: user.id });

    socket.on("receive_meme", (memeMessage) =>
      setChatMessages((prev) => [memeMessage, ...prev])
    );
    return () => socket.off("receive_meme");
  }, [isLoaded, user]);

  // Helper function to get axios config with Clerk session token
  const getAuthConfig = async () => {
    const token = await getToken();
    return {
      headers: { 
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true // Important for Clerk session cookies
    };
  };

  const fetchMemes = async () => {
    if (!isLoaded || !user) return;
    try {
      const config = await getAuthConfig();
      const lastId = memes.length > 0 ? memes[memes.length - 1]._id : null;
      const url = lastId
        ? `http://localhost:3000/memes?lastId=${lastId}&limit=6`
        : `http://localhost:3000/memes?limit=6`;

      const res = await axios.get(url, config);
      const fresh = res.data.memes.filter((m) => !seen.current.has(m._id));
      
      if (fresh.length === 0) return setHasMore(false);

      fresh.forEach((m) => seen.current.add(m._id));
      setMemes((prev) => [...prev, ...fresh]);
    } catch (err) {
      console.error("Failed to fetch memes:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
      }
    }
  };

  const handleLikeToggle = async (memeId) => {
    if (!isLoaded || !user) return;

    const meme = memes.find((m) => m._id === memeId);
    const hasLiked = meme?.like?.some((uid) => uid === user.id);

    // Optimistic update
    setMemes((prev) =>
      prev.map((m) => {
        if (m._id === memeId) {
          const updatedLikes = hasLiked
            ? m.like.filter((uid) => uid !== user.id)
            : [...(m.like || []), user.id];
          return { ...m, like: updatedLikes };
        }
        return m;
      })
    );

    // API call
    try {
      const config = await getAuthConfig();
      const endpoint = hasLiked ? "/unlike" : "/like";
      await axios.post(`http://localhost:3000${endpoint}`, { id: memeId }, config);
    } catch (err) {
      console.error("Like toggle failed:", err);
      // Revert optimistic update
      setMemes((prev) =>
        prev.map((m) => {
          if (m._id === memeId) {
            const revertedLikes = hasLiked
              ? [...(m.like || []), user.id]
              : m.like.filter((uid) => uid !== user.id);
            return { ...m, like: revertedLikes };
          }
          return m;
        })
      );
    }
  };

  const handleSend = async (receiverId) => {
    if (!isLoaded || !user || !modalMeme?._id || !receiverId) {
      return alert("Meme or receiver missing!");
    }

    try {
      const config = await getAuthConfig();
      await axios.post(
        "http://localhost:3000/send",
        { memeid: modalMeme._id, receiverId },
        config
      );

      // Emit socket event
      socket.emit("send_meme", {
        senderId: user.id,
        receiverId,
        meme: modalMeme,
      });

      alert("Meme sent successfully! 🚀");
      setShareModalOpen(false);
      setModalMeme(null);
    } catch (err) {
      console.error("Send meme error:", err);
      alert(err.response?.data?.error || "Failed to send meme");
    }
  };

  if (!isLoaded) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="auth-required">Please sign in to view memes</div>;
  }

  return (
    <>
      <div className={`feed ${shareModalOpen || commentModalOpen ? "blur" : ""}`}>
        <InfiniteScroll
          dataLength={memes.length}
          next={fetchMemes}
          hasMore={hasMore}
          loader={<p className="loader">Loading more memes...</p>}
          endMessage={<p className="end-message">No more memes 🤧</p>}
        >
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {memes.map((meme) => (
              <MemeCard
                key={meme._id}
                meme={meme}
                onShare={() => {
                  setModalMeme(meme);
                  setShareModalOpen(true);
                }}
                onComment={() => {
                  setCommentMeme(meme);
                  setCommentModalOpen(true);
                }}
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </Masonry>
        </InfiniteScroll>
      </div>

      {chatMessages.length > 0 && (
        <div className="shared-memes-feed">
          <h3>Received Memes</h3>
          {chatMessages.map((msg, idx) => (
            <MemeCard key={idx} meme={msg.meme} />
          ))}
        </div>
      )}

      {shareModalOpen && modalMeme && (
        <ShareModal
          meme={modalMeme}
          onClose={() => {
            setShareModalOpen(false);
            setModalMeme(null);
          }}
          onSend={handleSend}
        />
      )}

      {commentModalOpen && commentMeme && (
        <CommentModal
          meme={commentMeme}
          onClose={() => {
            setCommentModalOpen(false);
            setCommentMeme(null);
          }}
          onComment={(newComments) =>
            setMemes((prev) =>
              prev.map((m) =>
                m._id === commentMeme._id ? { ...m, comments: newComments } : m
              )
            )
          }
        />
      )}
    </>
  );
}
import React, { useEffect, useState, useRef } from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import axios from 'axios';
import Masonry from 'react-masonry-css';
import MemeCard from '../components/Chatmeme';
import "../styles/MemeFeed.css";

export default function MemeFeed() {
  const [memes, setMemes] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const seen = useRef(new Set());

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  const fetchMemes = async () => {
    try {
      const lastId = memes.length > 0 ? memes[memes.length - 1]._id : null;
      const url = lastId
        ? `http://localhost:3000/memes?lastId=${lastId}&limit=6`
        : `http://localhost:3000/memes?limit=6`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const incoming = res.data.memes;
      const fresh = incoming.filter(m => !seen.current.has(m._id));
      if (fresh.length === 0) {
        setHasMore(false);
        return;
      }

      fresh.forEach(m => seen.current.add(m._id));
      setMemes(prev => [...prev, ...fresh]);
    } catch (err) {
      console.error("Error fetching memes:", err);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, []);

  return (
    <InfiniteScroll
      dataLength={memes.length}
      next={fetchMemes}
      hasMore={hasMore}
      loader={<p style={{ textAlign: "center" }}>Loading more memes...</p>}
      endMessage={<p style={{ textAlign: "center" }}>No more memes 🤧</p>}
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
            onLike={() => handleLike(meme._id)}
          />
        ))}
      </Masonry>
    </InfiniteScroll>
  );
}

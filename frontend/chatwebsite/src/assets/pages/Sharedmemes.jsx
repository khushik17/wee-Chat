import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MemeCard from '../components/Chatmeme';
import socket from "../../socket";
import { useAuth } from "@clerk/clerk-react";
import API_URL from "../../config/api";

export default function SharedMemes() {
  const [sharedMemes, setSharedMemes] = useState([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${API_URL}/getshared`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSharedMemes(res.data.shared);
      } catch (err) {
        console.error('Error fetching shared memes:', err);
      }
    };

    fetchShared();

    socket.on("receive_meme", (memeMessage) => {
      setSharedMemes(prev => [memeMessage.meme, ...prev]);
    });

    return () => {
      socket.off("receive_meme");
    };
  }, [getToken]);

  return (
    <div className="cont">
      <h1 className="text-center text-2xl font-bold text-white my-4">Shared Memes</h1>
      {sharedMemes.length === 0 ? (
        <p className="text-center text-white">No memes shared with you yet.</p>
      ) : (
        sharedMemes.map((meme, index) => <MemeCard key={index} meme={meme} />)
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MemeCard from '../components/Chatmeme';

export default function SharedMemes() {
  const [sharedMemes, setSharedMemes] = useState([]);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await axios.get('http://localhost:3000/getshared', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setSharedMemes(res.data.sharedMemes);
      } catch (err) {
        console.error('Error fetching shared memes:', err);
      }
    };

    fetchShared();
  }, []);

  return (
    <div className="cont">
      <h1 className="text-center text-2xl font-bold text-white my-4">Shared Memes</h1>
      {sharedMemes.length === 0 ? (
        <p className="text-center text-white">No memes shared with you yet.</p>
      ) : (
        sharedMemes.map((share) => (
          <MemeCard key={share._id} meme={share.meme} />
        ))
      )}
    </div>
  );
}

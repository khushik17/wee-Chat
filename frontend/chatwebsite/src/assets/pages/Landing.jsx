import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const [showBall, setShowBall] = useState(false);
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowBall(true), 1500);
    const timer2 = setTimeout(() => {
      setShowBall(false);
      setShowImages(true);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="Container">
      <div className="Top">
        <div className="left">Logo or Title</div>
        <div className="right">
          <button onClick={() => navigate("/Login")}>Login</button>
          <button onClick={() => navigate("/Signup")}>Signup</button>
        </div>
      </div>

      <div className="Bottom">
        <div className="TextSection">
          <h1 className="LeftHeading">
            Connect, Chat, and Laugh — all in one place.
          </h1>
          <p className="LeftPara">
            Chat seamlessly with friends and groups.🗨 <br />
            Have fun, deep, or even silly conversations with AI.🤖 <br />
            Share memes and moments instantly.📸 <br />
            Customize your profile the way you like.✏ <br />
            Your new favorite hangout is here.
          </p>
        </div>

        {showBall && <div className="Ball" />}

        {showImages && (
          <div className="ImageRow">
            <img src="https://aceternity.com/images/products/thumbnails/new/smartbridge.png" className="ProductImage" />
            <img src="https://aceternity.com/images/products/thumbnails/new/renderwork.png" className="ProductImage" />
            <img src="https://aceternity.com/images/products/thumbnails/new/cremedigital.png" className="ProductImage" />
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Profile.css";
import { useUser, useAuth, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Profilepage() {
  return (
    <div className="Profile-Container">
      <Profile />
    </div>
  );
}

function Profile() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [savedData, setSavedData] = useState({ bio: "", username: "" });

  // ✅ NEW: Sync user to MongoDB on first load
  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncUserToDB = async () => {
      try {
        const token = await getToken({ template: "my-jwt-template" });
        
        // ✅ Create user in MongoDB (if not exists)
        await axios.post(
          "http://localhost:3000/api/users/create",
          {
            clerkId: user.id,
            username: user.username,  // ✅ Clerk se username
            email: user.primaryEmailAddress?.emailAddress,
            profilePicture: user.imageUrl
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log("✅ User synced to MongoDB");
      } catch (err) {
        console.error("Error syncing user:", err);
      }
    };

    syncUserToDB();
  }, [isLoaded, user, getToken]);

  // ✅ Fetch profile from backend
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchProfile = async () => {
      try {
        const token = await getToken({ template: "my-jwt-template" });
        const res = await axios.get("http://localhost:3000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.user;
        setSavedData({
          bio: data.bio || "",
          username: data.username || "",
        });

        if (data.profilePicture) setProfilePic("http://localhost:3000" + data.profilePicture);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, [isLoaded, user, getToken]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleEditToggle = () => setShowForm(!showForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || !user) return;

    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("username", username);
    if (selectedFile) formData.append("profilePicture", selectedFile);

    try {
      const token = await getToken({ template: "my-jwt-template" });
      const response = await axios.put("http://localhost:3000/update", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      const data = response.data.user;
      setSavedData({
        bio: data.bio || "",
        username: data.username || "",
      });

      if (data.profilePicture) setProfilePic("http://localhost:3000" + data.profilePicture);
      setShowForm(false);
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Update failed");
    }
  };

  return (
    <div className="Container">
      {/* Waves Background */}
      <div className="SVG-Background">
        <svg
          id="visual"
          viewBox="0 0 900 600"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
        >
          <path
            className="wave1"
            d="M0 378L21.5 378.8C43 379.7 86 381.3 128.8 390.3C171.7 399.3 214.3 415.7 257.2 426.7C300 437.7 343 443.3 385.8 445C428.7 446.7 471.3 444.3 514.2 430.3C557 416.3 600 390.7 642.8 389.7C685.7 388.7 728.3 412.3 771.2 425.8C814 439.3 857 442.7 878.5 444.3L900 446L900 601L0 601Z"
            fill="#fa7268"
          ></path>
          <path
            className="wave2"
            d="M0 477L21.5 470.2C43 463.3 86 449.7 128.8 449.7C171.7 449.7 214.3 463.3 257.2 470.5C300 477.7 343 478.3 385.8 465.2C428.7 452 471.3 425 514.2 424.3C557 423.7 600 449.3 642.8 458C685.7 466.7 728.3 458.3 771.2 452C814 445.7 857 441.3 878.5 439.2L900 437L900 601L0 601Z"
            fill="#ef5f67"
          ></path>
          <path
            className="wave3"
            d="M0 447L21.5 451.5C43 456 86 465 128.8 467.5C171.7 470 214.3 466 257.2 469C300 472 343 482 385.8 484.7C428.7 487.3 471.3 482.7 514.2 482.7C557 482.7 600 487.3 642.8 490.7C685.7 494 728.3 496 771.2 493.8C814 491.7 857 485.3 878.5 482.2L900 479L900 601L0 601Z"
            fill="#e34c67"
          ></path>
        </svg>
      </div>

      {/* Floating Arrows */}
      <div className="Floating-Arrows">
        <ArrowLeft className="Arrow Left" size={28} onClick={() => navigate("/memeFeed")} />
        <ArrowRight className="Arrow Right" size={28} onClick={() => navigate("/chat")} />
      </div>

      {/* Profile Box */}
      <div className="Profile-Box Centered">
        <div
          className="Profile-Picture"
          onClick={() => document.getElementById("imageInput").click()}
        >
          <img
            src={
              profilePic ||
              "https://icon-library.com/images/default-user-icon/default-user-icon-8.jpg"
            }
            alt="Profile"
          />
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>

        <h2>{user?.fullName || "Your Name"}</h2>
        <p>{savedData.bio || "Your bio will appear here"}</p>
        <h4>@{savedData.username || user?.username || "username_here"}</h4>

        <button className="edit-btn" onClick={handleEditToggle}>
          {showForm ? "Cancel" : "Edit Profile"}
        </button>

        <UserButton />

        {showForm && (
          <form className="Edit-Form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit">Update</button>
          </form>
        )}
      </div>
    </div>
  );
}
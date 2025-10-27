import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Profile.css";
import { useUser, useAuth, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Profilepage() {
  return (
    <div className="Profile-Container">
      {/* Shooting Stars */}
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [savedData, setSavedData] = useState({ bio: "", username: "" });

  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  // Sync user to MongoDB - ONLY ONCE
  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncUserToDB = async () => {
      try {
        const token = await getToken({ template: "my-jwt-template" });
        // ✅ FIX: Don't send profilePicture to avoid overwriting custom uploads
        await axios.post(
          "http://localhost:3000/api/users/create",
          {
            clerkId: user.id,
            username: user.username,
            email: user.primaryEmailAddress?.emailAddress,
            // ❌ REMOVED: profilePicture: user.imageUrl
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (err) {
        console.error("Error syncing user:", err);
      }
    };

    syncUserToDB();
  }, [isLoaded, user, getToken]);

  // Fetch profile data
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchProfile = async () => {
      try {
        const token = await getToken({ template: "my-jwt-template" });
        const res = await axios.get("http://localhost:3000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.user;
        console.log("📥 Profile data received:", data);
        
        setSavedData({
          bio: data.bio || "",
          username: data.username || "",
        });

        // ✅ FIX: Properly set profile picture
        if (data.profilePicture) {
          if (data.profilePicture.startsWith('http')) {
            setProfilePic(data.profilePicture);
          } else {
            setProfilePic(`http://localhost:3000${data.profilePicture}`);
          }
          console.log("✅ Profile pic set:", data.profilePicture);
        } else {
          setProfilePic(null);
          console.log("⚠️ No profile picture in DB");
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, [isLoaded, user, getToken]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      console.log("📸 Image selected:", file.name);
    }
  };

  // Toggle edit form
  const handleEditToggle = () => setShowForm(!showForm);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || !user) return;

    const formData = new FormData();
    if (bio) formData.append("bio", bio);
    if (username) formData.append("username", username);
    if (selectedFile) formData.append("profilePicture", selectedFile);

    console.log("📤 Uploading:", { bio, username, hasFile: !!selectedFile });

    try {
      const token = await getToken({ template: "my-jwt-template" });
      const response = await axios.put("http://localhost:3000/update", formData, {
        headers: { 
          "Content-Type": "multipart/form-data", 
          Authorization: `Bearer ${token}` 
        },
      });

      const data = response.data.user;
      console.log("✅ Update response:", data);
      
      setSavedData({
        bio: data.bio || "",
        username: data.username || "",
      });

      // ✅ FIX: Update profile picture after successful upload
      if (data.profilePicture) {
        const newPicUrl = data.profilePicture.startsWith('http') 
          ? data.profilePicture 
          : `http://localhost:3000${data.profilePicture}`;
        setProfilePic(newPicUrl);
        console.log("✅ Profile pic updated:", newPicUrl);
      }
      
      // Clear preview and form
      setPreviewUrl(null);
      setSelectedFile(null);
      setBio("");
      setUsername("");
      setShowForm(false);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("❌ Profile update failed", err);
      alert("Update failed: " + (err.response?.data?.error || err.message));
    }
  };

  // Determine which image to show
  const displayImage = previewUrl || profilePic;

  return (
    <div className="Container">
      {/* Navigation Arrows */}
      <div className="Floating-Arrows">
        <ArrowLeft 
          className="Arrow Left" 
          size={28} 
          onClick={() => navigate("/memeFeed")} 
        />
        <ArrowRight 
          className="Arrow Right" 
          size={28} 
          onClick={() => navigate("/chat")} 
        />
      </div>

      {/* Profile Box */}
      <div className="Profile-Box">
        {/* Profile Picture */}
        <div className="Profile-Picture-Upload" 
             onClick={() => document.getElementById("imageInput").click()}>
          <div className="Profile-Picture">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Profile"
                onError={(e) => {
                  console.error("❌ Image load error:", e.target.src);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="profile-picture-fallback"
              style={{
                display: displayImage ? 'none' : 'flex',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '48px',
                border: '3px solid #4a90e2',
                boxShadow: '0 0 20px rgba(74, 144, 226, 0.3)'
              }}
            >
              {getInitials(user?.fullName || savedData.username || user?.username)}
            </div>
          </div>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>

        {/* Profile Info */}
        <h2>{user?.fullName || "Your Name"}</h2>
        <p>{savedData.bio || "Your bio will appear here"}</p>
        <h4>@{savedData.username || user?.username || "username_here"}</h4>

        {/* Action Buttons */}
        <button className="edit-btn" onClick={handleEditToggle}>
          {showForm ? "Cancel" : "Edit Profile"}
        </button>

        {/* User Button (Sign Out) - Normal Size */}
        <div className="user-button-wrapper">
          <UserButton />
        </div>

        {/* Edit Form */}
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
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Profile.css";

export default function Profilepage() {
  return (
    <div className="Profile-Container">
      <Profile />
    </div>
  );
}

function Profile() {
  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [savedData, setSavedData] = useState({
    bio: "",
    username: "",
    name: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:3000/profile", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        const user = res.data.user;
        setSavedData({
          bio: user.bio || "",
          username: user.username || "",
          name: user.name || "",
        });

        if (user.profilePicture) {
          setProfilePic("http://localhost:3000" + user.profilePicture);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, []);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    setProfilePic(URL.createObjectURL(file));
    }
  };
  const handleEditToggle = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("username", username);
    formData.append("name", name);

   if (selectedFile) {
  formData.append("profilePicture", selectedFile);
}


    try {
      const response = await axios.put("http://localhost:3000/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      const user = response.data.user;

      setSavedData({
        bio: user.bio || "",
        username: user.username || "",
        name: user.name || "",
      });

      if (user.profilePicture) {
        setProfilePic("http://localhost:3000" + user.profilePicture);
      }

      setShowForm(false);
    } catch (error) {
      console.error("Profile update failed", error);
      alert("Update failed");
    }
  };

  return (
    <>
    <div className="Container">
      <div className="SVG-Background">
        <svg
          id="visual" viewBox="0 0 900 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1">
           
          <path   className="wave1" 
          d="M0 378L21.5 378.8C43 379.7 86 381.3 128.8 390.3C171.7 399.3 214.3 415.7 257.2 426.7C300 437.7 343 443.3 385.8 445C428.7 446.7 471.3 444.3 514.2 430.3C557 416.3 600 390.7 642.8 389.7C685.7 388.7 728.3 412.3 771.2 425.8C814 439.3 857 442.7 878.5 444.3L900 446L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z" fill="#fa7268"></path>
          
          <path className="wave2" 
          d="M0 477L21.5 470.2C43 463.3 86 449.7 128.8 449.7C171.7 449.7 214.3 463.3 257.2 470.5C300 477.7 343 478.3 385.8 465.2C428.7 452 471.3 425 514.2 424.3C557 423.7 600 449.3 642.8 458C685.7 466.7 728.3 458.3 771.2 452C814 445.7 857 441.3 878.5 439.2L900 437L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z" fill="#ef5f67"></path>
        
        <path className="wave3" 
         d="M0 447L21.5 451.5C43 456 86 465 128.8 467.5C171.7 470 214.3 466 257.2 469C300 472 343 482 385.8 484.7C428.7 487.3 471.3 482.7 514.2 482.7C557 482.7 600 487.3 642.8 490.7C685.7 494 728.3 496 771.2 493.8C814 491.7 857 485.3 878.5 482.2L900 479L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z" fill="#e34c67"></path>
        
        <path className="wave4" 
         d="M0 504L21.5 510.3C43 516.7 86 529.3 128.8 531.2C171.7 533 214.3 524 257.2 519.3C300 514.7 343 514.3 385.8 518.5C428.7 522.7 471.3 531.3 514.2 530.3C557 529.3 600 518.7 642.8 518.7C685.7 518.7 728.3 529.3 771.2 531.3C814 533.3 857 526.7 878.5 523.3L900 520L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z" fill="#d53867"></path>
        
        <path className="wave5" 
         d="M0 542L21.5 546.3C43 550.7 86 559.3 128.8 558.3C171.7 557.3 214.3 546.7 257.2 547.7C300 548.7 343 561.3 385.8 566.7C428.7 572 471.3 570 514.2 563.5C557 557 600 546 642.8 546C685.7 546 728.3 557 771.2 560.7C814 564.3 857 560.7 878.5 558.8L900 557L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z" fill="#c62368"></path>
        </svg>
      </div>
      <div className="Profile-Box">
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

        <h2>{savedData.name || "Your Name"}</h2>
        <p>{savedData.bio || "Your bio will appear here"}</p>
        <h4>@{savedData.username || "username_here"}</h4>

        <button className="edit-btn" onClick={handleEditToggle}>
          {showForm ? "Cancel" : "Edit Profile"}
        </button>

        {showForm && (
          <form className="Edit-Form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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

    </>
  );
}
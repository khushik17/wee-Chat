import React,{useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Final.css"

export  default function Finalsignup(){
    return(
        <div class="container">
  <div class="left-panel">
     <div className="Box">
    <h2>Details</h2>
  <Finalsignupdetails/>
  </div>
  </div>
  <div class="right-panel">
    <img src="https://img.freepik.com/free-vector/personal-site-concept-illustration_114360-3417.jpg" class="illustration" />
  </div>
</div>

    )
}

function Finalsignupdetails(){
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [number, setNumber] = useState("");
    const [name, setName]= useState('');
    const navigate = useNavigate();
    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        try{
            const response = await axios.post("http://localhost:3000/signup", {
                email: email,
                username: username,
                password: password, 
                name: name,
                phone: number})
            console.log(response.data);
            navigate("/profile");
        }catch(error){
    const msg = error.response?.data?.error || error.response?.data?.message || error.message;
    alert("Signup failed: " + msg);
}

    }
    return(
        <>
        <form onSubmit={handleSignup} className="Final-form">
            <input type="text" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
            
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /> 
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
            <input type="text" placeholder="Contact Number" value={number} onChange={(e) => setNumber(e.target.value)} />
            <button type="submit">signup yeeyeee</button>
        </form>
        <p className="Puchku">Already have an account? 
            <button onClick={() => navigate("/login")}>Login</button></p>
        </>
    )
}
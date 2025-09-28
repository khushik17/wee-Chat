import React,{useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../styles/Login.css";
export default function LoginPage(){
    
    return(
        <div className="Login-Container">
            <div className="Login-Box">
               <UsernamePass/>
            </div>
        </div>
        
        

    )
}

function UsernamePass(){
    const [username, setUsername] = useState("");
    const [pass, setPass] = useState("");
    const navigate = useNavigate();
    const handleLogin = async(e)=>{
        e.preventDefault();
        try{
            const response = await axios.post("http://localhost:3000/login", {
                username: username,
                password: pass
        });
        localStorage.setItem("token", response.data.token);
        console.log(response.data);
        navigate("/profile");
}catch(error){
            alert("Login failed. Please check your credentials." + error.response?.data?.message || error.message);
    }
}

    return(
        <>
        <form onSubmit={handleLogin} className="Form">
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
        <button type="submit">Yeyeye!!</button>
        </form>
        
        </>
    )

}

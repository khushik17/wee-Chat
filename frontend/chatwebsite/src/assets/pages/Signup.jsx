import React, {useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import Particles from "../components/Particles";


export default function Signup(){
    return(<>
        <div className="Signup-Container">
              <Particles/>
            <div className="Signup-Box">
                <h2>Signup</h2>
               <Number/>
             
            </div>
        </div>
</>
    )
}

function Number(){
    const [number, setNumber] = useState("");
    const navigate = useNavigate();
    const handleNumber = async (e)=>{
        e.preventDefault();
        try{
            const response = await axios.post("http://localhost:3000/otpSMS", {
                phone: number
        });
        console.log(response.data);
        navigate("/otp", { state: { phone: number } });
        }catch(error){
            console.error(error); 
         alert("OTP failed: " + (error?.response?.data?.error || error.message));

        }
    }
    return(
        <>
        <form onSubmit={handleNumber} className="signup-form">
            <input type="text" placeholder="Enter your number" value={number} onChange={(e)=> setNumber(e.target.value)} />
            <button type="submit"
            >Send OTP</button>
        </form>
        </>
    )

}
import React,{useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import "../styles/otp.css";
export default function OtpPage(){
    return(
        <div>
<div className="Otp-Container">
    <div className="Otp-Box">
       <h2>OTP</h2>
       <Otp/>
    </div>
</div>
</div>
    );}
function Otp(){
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();
const location = useLocation();
const phone = location.state?.phone;
if (!phone) {
    navigate("/signup");
    return null;
}

    const handleOtp = async (e)=>{
        e.preventDefault();
        try{
            const response = await axios.post("http://localhost:3000/otpVerify", {
            phone: phone,
                otp: otp
        });
        console.log(response.data);
        navigate("/signup-details");
        }catch(error){
            alert("OTP verification failed. Please check your OTP." + error.response?.data?.message || error.message);
        }
}
return(
    <>
    <form onSubmit={handleOtp} className="Otp-form">
        <input type="text" placeholder="Enter your OTP" value={otp} onChange={(e)=> setOtp(e.target.value)} />
        <button type="submit">Verify OTP</button>
         </form>
        <p className="Dhoka">Didn't receive OTP?
             <button onClick={() => navigate("/signup")}>Resend OTP</button>
             </p>
            
    </>
)
}
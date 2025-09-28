const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendOtp(phone) {
    console.log("Sending OTP to:", phone);
    console.log("Using SID:", process.env.TWILIO_VERIFY_SERVICE_SID); 
    return await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
        .verifications.create({ to: `+91${phone}`, channel: 'sms' });
}

async function verifyOtp(phone, otp) {
    return await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
        .verificationChecks.create({ to: `+91${phone}`, code: otp });
}

module.exports = { sendOtp, verifyOtp };

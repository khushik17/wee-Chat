import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GROQ_API_KEY; // ✅ Changed to GROQ

console.log("=== Groq Configuration ===");
console.log("API Key present:", !!API_KEY);
if (API_KEY) {
  console.log("API Key prefix:", API_KEY.substring(0, 8) + "...");
}
console.log("==============================");

let chatHistory = [
  {
    role: "system",
    content: "You are a helpful assistant that gives concise and polite answers.",
  }
];

async function chatWithGroq(userMessage) {
  try {
    if (!API_KEY || API_KEY.trim() === '') {
      console.error("❌ GROQ_API_KEY not found in .env file");
      return "API key is missing. Please add GROQ_API_KEY to your .env file.";
    }

    console.log("✅ Sending message to Groq");
    
    chatHistory.push({ role: "user", content: userMessage });

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions", // ✅ Groq URL
      {
        model: "llama-3.3-70b-versatile", // ✅ Free model
        messages: chatHistory,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const botReply = response.data.choices[0].message.content;
    chatHistory.push({ role: "assistant", content: botReply });
    
    console.log("✅ Response received from Groq");
    console.log("Response preview:", botReply.substring(0, 60) + "...");
    
    return botReply;
    
  } catch (err) {
    console.error("\n❌ === Groq ERROR === ❌");
    console.error("Status Code:", err?.response?.status);
    console.error("Error Message:", err?.response?.data?.error?.message || err.message);
    console.error("Full Error:", JSON.stringify(err?.response?.data, null, 2));
    console.error("==========================\n");
    
    const status = err?.response?.status;
    const errorMsg = err?.response?.data?.error?.message || "";
    
    if (status === 400) {
      return "Bad request. Please try a different message.";
    }
    
    if (status === 401) {
      return "❌ Invalid API key. Please check your GROQ_API_KEY in .env file.";
    }
    
    if (status === 429) {
      return "⏳ Rate limit exceeded. Please wait and try again!";
    }
    
    if (status === 500 || status === 503) {
      return "🔧 Groq servers are down. Try again in a few minutes.";
    }
    
    return `❌ Error: ${errorMsg || "Something went wrong. Please try again!"}`;
  }
}

export function resetChatHistory() {
  chatHistory = [
    {
      role: "system",
      content: "You are a helpful assistant that gives concise and polite answers.",
    }
  ];
  console.log("✅ Chat history reset");
}

export default chatWithGroq; // ✅ Export name changed
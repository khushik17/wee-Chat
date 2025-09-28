const axios = require("axios");
const API_KEY = process.env.YOUR_OPENROUTER_API_KEY;


let chatHistory = [
  {
    role: "system",
    content: "You are a helpful assistant that gives concise and polite answers.",
  }
];

async function chatWithDeepSeek(userMessage) {
  try {
    console.log("Using API key:", API_KEY);
    chatHistory.push({ role: "user", content: userMessage });

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: chatHistory,
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
        },
      }
    );

    const botReply =  response.data.choices[0].message.content;
    chatHistory.push({ role: "assistant", content: botReply });
return botReply;
  } catch (err) {
    console.error("DeepSeek error:", err?.response?.data || err.message);
    return "Sorry, something went wrong.";
  }
}

module.exports = chatWithDeepSeek;
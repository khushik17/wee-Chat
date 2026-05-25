# 💬 Wee-Chat

A real-time chat app with AI chatbot, meme feed, and user-to-user messaging.

🌐 **Live:** [wee-chat.vercel.app](https://wee-chat.vercel.app)

---

## Features

- 🔐 Secure authentication with Clerk
- ⚡ Real-time messaging via Socket.IO
- 🤖 AI chatbot powered by DeepSeek
- 😂 Meme feed with likes, comments & sharing
- 👤 User profiles with bio and profile picture
- 🔍 Search users and start chatting

---

## Tech Stack

**Frontend:** React, Vite, React Router, Socket.IO Client, Clerk, Axios

**Backend:** Node.js, Express, MongoDB, Socket.IO, Multer, Zod

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/khushik17/wee-Chat.git
cd wee-Chat
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URL=your_mongodb_url
CLERK_SECRET_KEY=your_clerk_secret
FRONTEND_URL=http://localhost:5173
PORT=3000
DEEPSEEK_API_KEY=your_deepseek_key
```

```bash
npm start
```

### 3. Setup Frontend

```bash
cd frontend/chatwebsite
npm install
```

Create a `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

---

## Pages

| Route | Page |
|---|---|
| `/` | Landing |
| `/sign-in` | Login |
| `/sign-up` | Sign Up |
| `/chat` | Chat Hub |
| `/chat/users` | User Chat |
| `/chat/bot` | AI Chatbot |
| `/profile` | Profile |
| `/memeFeed` | Meme Feed |

---

## Author

**Khushi Kabra**

- GitHub: [@khushik17](https://github.com/khushik17)
- LinkedIn: [Khushi Kabra](https://www.linkedin.com/in/khushi-kabra-368b8b2b3/)

---

Made with ❤️ by Khushi Kabra

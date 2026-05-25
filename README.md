<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&pause=1000&color=7C3AED&center=true&vCenter=true&width=600&lines=💬+Wee-Chat;Real-Time+Chat+App;AI+Chatbot+%2B+Meme+Feed" alt="Typing SVG" />

<br/>

<img src="https://img.shields.io/badge/🚀_Live_Demo-wee--chat.vercel.app-7C3AED?style=for-the-badge" />

<br/><br/>

<a href="https://wee-chat.vercel.app">
  <img src="https://img.shields.io/badge/▶_Open_App-wee--chat.vercel.app-4f46e5?style=for-the-badge&logoColor=white" />
</a>
&nbsp;
<a href="https://github.com/khushik17/wee-Chat">
  <img src="https://img.shields.io/badge/GitHub-khushik17-181717?style=for-the-badge&logo=github&logoColor=white" />
</a>
&nbsp;
<a href="https://www.linkedin.com/in/khushi-kabra-368b8b2b3/">
  <img src="https://img.shields.io/badge/LinkedIn-Khushi_Kabra-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
</a>

<br/><br/>

> **A modern full-stack real-time chat app** — featuring instant messaging, AI chatbot powered by DeepSeek, a meme feed with likes & comments, and secure authentication via Clerk.

<br/>

![Stars](https://img.shields.io/github/stars/khushik17/wee-Chat?style=social)
![Forks](https://img.shields.io/github/forks/khushik17/wee-Chat?style=social)

</div>

---

## 🌟 Features

| Feature | Description |
|:---:|:---|
| 🔐 | **Secure Auth** — Sign up & login with Clerk (JWT protected) |
| ⚡ | **Real-time Chat** — Instant user-to-user messaging via Socket.IO |
| 🤖 | **AI Chatbot** — Powered by DeepSeek AI built right inside the app |
| 😂 | **Meme Feed** — Browse, like, comment & share memes with friends |
| 📤 | **Meme Sharing** — Send memes directly inside user chats |
| 👤 | **User Profiles** — Upload profile picture, set bio & username |
| 🔍 | **User Search** — Find and start chatting with any registered user |
| 📱 | **Responsive** — Works beautifully on mobile and desktop |

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
<img src="https://skillicons.dev/icons?i=react,vite,js,css,html" />

| Tech | Version | Use |
|---|---|---|
| ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) | v19 | UI Framework |
| ![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white) | v6 | Build Tool |
| ![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white) | v7 | Client Routing |
| ![Socket.IO](https://img.shields.io/badge/Socket.IO_Client-4-010101?logo=socketdotio&logoColor=white) | v4 | Real-time Events |
| ![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white) | latest | Authentication |
| ![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?logo=axios&logoColor=white) | latest | API Calls |
| ![Framer](https://img.shields.io/badge/Framer_Motion-Animations-0055FF?logo=framer&logoColor=white) | latest | Animations |

<br/>

### Backend
<img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,socketio" />

| Tech | Version | Use |
|---|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=nodedotjs&logoColor=white) | v18 | Runtime |
| ![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white) | v5 | REST API |
| ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white) | latest | Database |
| ![Socket.IO](https://img.shields.io/badge/Socket.IO-Server-010101?logo=socketdotio&logoColor=white) | v4 | WebSockets |
| ![Multer](https://img.shields.io/badge/Multer-File_Upload-FF6600?logoColor=white) | v2 | Image Uploads |
| ![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1?logoColor=white) | v3 | Input Validation |

</div>

---

## 📁 Project Structure

```
📦 wee-Chat/
├── 🗄️ backend/
│   ├── 📄 index.js          ← Express server + Socket.IO + all routes
│   ├── 📄 db.js             ← MongoDB schemas (User, Chat, Meme, Share)
│   ├── 📄 deepseek.js       ← DeepSeek AI chatbot integration
│   ├── 📄 type.js           ← Zod validation schemas
│   ├── 📁 uploads/          ← Profile picture storage
│   └── 📄 package.json
│
└── 🖥️ frontend/chatwebsite/
    └── src/
        ├── 📁 assets/
        │   ├── 📁 pages/
        │   │   ├── 🏠 Landing.jsx      ← Public home/landing page
        │   │   ├── 🔑 Login.jsx        ← Clerk sign-in
        │   │   ├── 📝 Signup.jsx       ← Clerk sign-up
        │   │   ├── 💬 Chat.jsx         ← Main chat hub
        │   │   ├── 👥 Chatuser.jsx     ← User-to-user chat
        │   │   ├── 🤖 Chatbot.jsx      ← AI chatbot page
        │   │   ├── 😂 MemeFeed.jsx     ← Meme browsing feed
        │   │   └── 👤 Profile.jsx      ← User profile page
        │   ├── 📁 components/
        │   │   ├── Navbar.jsx
        │   │   ├── Chatmeme.jsx
        │   │   ├── CommentModal.jsx
        │   │   └── Sharemodel.jsx
        │   └── 📁 styles/
        ├── 🔀 App.jsx                  ← Routes & protected routes
        └── ⚡ main.jsx                 ← App entry point
```

---

## 🚀 Getting Started

### ✅ Prerequisites

- ![Node](https://img.shields.io/badge/Node.js-v18+-339933?logo=nodedotjs) 
- ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
- ![Clerk](https://img.shields.io/badge/Clerk-Account-6C47FF?logo=clerk)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/khushik17/wee-Chat.git
cd wee-Chat
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create **`backend/.env`**:

```env
MONGO_URL=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
FRONTEND_URL=http://localhost:5173
PORT=3000
DEEPSEEK_API_KEY=your_deepseek_api_key
```

```bash
npm start
# ✅ Server running on http://localhost:3000
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend/chatwebsite
npm install
```

Create **`frontend/chatwebsite/.env`**:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
# ✅ App running on http://localhost:5173
```

---

## 🌐 API Reference

### 👤 User
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/users/create` | ❌ | Register / sync user from Clerk |
| `GET` | `/profile` | ✅ | Get logged-in user profile |
| `PUT` | `/update` | ✅ | Update bio, username, profile pic |
| `GET` | `/search` | ✅ | Fetch current user info |
| `GET` | `/chat-search?q=name` | ✅ | Search users to chat with |

### 💬 Chat
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/getmessages?with=userId` | ✅ | Fetch messages between two users |
| `GET` | `/recent-chats` | ✅ | Get all recent conversations |
| `POST` | `/chat` | ✅ | Send message to AI chatbot |

### 😂 Memes
| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/memes` | ✅ | Fetch paginated meme feed |
| `POST` | `/like` | ✅ | Like a meme |
| `POST` | `/unlike` | ✅ | Unlike a meme |
| `POST` | `/comment` | ✅ | Comment on a meme |
| `POST` | `/send` | ✅ | Share meme with a user |
| `GET` | `/getshared` | ✅ | Get memes shared with you |

---

## 🔌 Socket.IO Events

```
Client ──────────────────────────────► Server
  join        { userId }               → Join personal room
  send_message { senderId, receiverId, message } → Send text
  send_meme   { senderId, receiverId, meme }     → Send meme
  typing      { receiverId }           → Typing indicator

Server ──────────────────────────────► Client
  receive_message { senderId, text, timeStamp }  ← New message
  receive_meme    { senderId, meme, timeStamp }  ← New meme
  typing                                         ← Someone typing
  online_users    [ userId, ... ]                ← Online user list
```

---

## 🗺️ App Routes

| Route | Page | 🔒 |
|---|---|:---:|
| `/` | 🏠 Landing Page | Public |
| `/sign-in` | 🔑 Login | Public |
| `/sign-up` | 📝 Sign Up | Public |
| `/chat` | 💬 Chat Hub | Protected |
| `/chat/users` | 👥 User Chat | Protected |
| `/chat/bot` | 🤖 AI Chatbot | Protected |
| `/profile` | 👤 User Profile | Protected |
| `/memeFeed` | 😂 Meme Feed | Protected |

---

## 🚢 Deployment

<div align="center">

| Service | Platform |
|:---:|:---:|
| 🖥️ **Frontend** | [![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel)](https://vercel.com) |
| ⚙️ **Backend** | [![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white)](https://render.com) |
| 🗄️ **Database** | [![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas) |
| 🔐 **Auth** | [![Clerk](https://img.shields.io/badge/Clerk-6C47FF?logo=clerk&logoColor=white)](https://clerk.dev) |

</div>

---

## 👩‍💻 Author

<div align="center">

<img src="https://github.com/khushik17.png" width="100" style="border-radius:50%" />

### Khushi Kabra

*Full Stack Developer*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/khushi-kabra-368b8b2b3/)
&nbsp;
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/khushik17)

</div>

---

<div align="center">

Made with ❤️ by **Khushi Kabra**

⭐ **If you like this project, give it a star!** ⭐

</div>

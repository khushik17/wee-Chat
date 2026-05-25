# 💬 Wee-Chat

<div align="center">

![Wee-Chat Banner](https://img.shields.io/badge/Wee--Chat-Real%20Time%20Chat%20App-blueviolet?style=for-the-badge&logo=chatbot)

**A modern real-time chat application with AI chatbot, meme feed, and secure user messaging.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-wee--chat.vercel.app-4f46e5?style=for-the-badge)](https://wee-chat.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-khushik17-181717?style=for-the-badge&logo=github)](https://github.com/khushik17/wee-Chat)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Khushi%20Kabra-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/khushi-kabra-368b8b2b3/)

</div>

---

## ✨ Features

- 🔐 **Authentication** — Secure sign up / login via [Clerk](https://clerk.dev)
- 💬 **Real-time Messaging** — Instant user-to-user chat powered by Socket.IO
- 🤖 **AI Chatbot** — Chat with DeepSeek AI directly inside the app
- 😂 **Meme Feed** — Browse, like, comment, and share memes with friends
- 📤 **Share Memes** — Send memes directly to other users in chat
- 👤 **User Profiles** — Upload profile pictures, set bio and username
- 🔍 **User Search** — Find and start chatting with any registered user
- 📱 **Responsive Design** — Works beautifully on all screen sizes

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI Framework |
| React Router DOM | Client-side routing |
| Socket.IO Client | Real-time communication |
| Clerk React | Authentication UI |
| Axios | HTTP requests |
| Lucide React | Icons |
| Framer Motion | Animations |
| React Masonry CSS | Meme grid layout |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| Socket.IO | WebSocket server |
| MongoDB + Mongoose | Database |
| Clerk Express | Auth middleware |
| Multer | File/image uploads |
| Axios | Meme API fetching |
| Zod | Input validation |
| OpenAI / DeepSeek | AI Chatbot |

---

## 📁 Project Structure

```
wee-Chat/
├── backend/
│   ├── index.js          # Express server + Socket.IO + all API routes
│   ├── db.js             # MongoDB schemas (User, Chat, Meme, Share)
│   ├── deepseek.js       # DeepSeek AI chatbot integration
│   ├── type.js           # Zod validation schemas
│   ├── uploads/          # Uploaded profile pictures
│   └── package.json
│
└── frontend/
    └── chatwebsite/
        └── src/
            ├── assets/
            │   ├── pages/
            │   │   ├── Landing.jsx      # Public landing/home page
            │   │   ├── Login.jsx        # Clerk sign-in page
            │   │   ├── Signup.jsx       # Clerk sign-up page
            │   │   ├── Chat.jsx         # Main chat hub
            │   │   ├── Chatuser.jsx     # User-to-user chat
            │   │   ├── Chatbot.jsx      # AI chatbot page
            │   │   ├── MemeFeed.jsx     # Meme browsing feed
            │   │   ├── Profile.jsx      # User profile page
            │   │   └── Sharedmemes.jsx  # Shared memes view
            │   ├── components/
            │   │   ├── Navbar.jsx       # Navigation bar
            │   │   ├── Chatmeme.jsx     # Meme in chat component
            │   │   ├── CommentModal.jsx # Meme comments modal
            │   │   └── Sharemodel.jsx   # Share meme modal
            │   └── styles/             # CSS stylesheets
            ├── App.jsx                  # Routes & protected routes
            └── main.jsx                 # App entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- MongoDB Atlas account
- Clerk account
- DeepSeek / OpenAI API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/khushik17/wee-Chat.git
cd wee-Chat
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
MONGO_URL=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
FRONTEND_URL=http://localhost:5173
PORT=3000
DEEPSEEK_API_KEY=your_deepseek_api_key
```

Start the backend:

```bash
npm start
```

---

### 3. Frontend Setup

```bash
cd frontend/chatwebsite
npm install
```

Create a `.env` file in `frontend/chatwebsite/`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

---

## 🌐 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/users/create` | ❌ | Register/sync user |
| `GET` | `/profile` | ✅ | Get user profile |
| `PUT` | `/update` | ✅ | Update profile (bio, username, picture) |
| `GET` | `/search` | ✅ | Search current user |
| `GET` | `/chat-search` | ✅ | Search users to chat |
| `GET` | `/getmessages` | ✅ | Get chat messages |
| `GET` | `/recent-chats` | ✅ | Get recent conversations |
| `POST` | `/chat` | ✅ | Send message to AI chatbot |
| `GET` | `/memes` | ✅ | Fetch meme feed |
| `POST` | `/like` | ✅ | Like a meme |
| `POST` | `/unlike` | ✅ | Unlike a meme |
| `POST` | `/comment` | ✅ | Comment on a meme |
| `POST` | `/send` | ✅ | Share meme with a user |
| `GET` | `/getshared` | ✅ | Get memes shared with you |

---

## 🔌 Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `join` | Client → Server | Join personal room |
| `send_message` | Client → Server | Send a text message |
| `receive_message` | Server → Client | Receive a text message |
| `send_meme` | Client → Server | Send a meme in chat |
| `receive_meme` | Server → Client | Receive a meme in chat |
| `typing` | Client → Server | Typing indicator |
| `online_users` | Server → Client | Broadcast online users |

---

## 🗺️ App Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing Page | 🌐 Public |
| `/sign-in` | Login | 🌐 Public |
| `/sign-up` | Sign Up | 🌐 Public |
| `/chat` | Chat Hub | 🔒 Protected |
| `/chat/users` | User Chat | 🔒 Protected |
| `/chat/bot` | AI Chatbot | 🔒 Protected |
| `/profile` | User Profile | 🔒 Protected |
| `/memeFeed` | Meme Feed | 🔒 Protected |

---

## 🚢 Deployment

| Layer | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) / [Railway](https://railway.app) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| Auth | [Clerk](https://clerk.dev) |

---

## 👩‍💻 Author

**Khushi Kabra**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin)](https://www.linkedin.com/in/khushi-kabra-368b8b2b3/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?logo=github)](https://github.com/khushik17)

---

<div align="center">

Built with ❤️ by **Khushi Kabra**

⭐ Star this repo if you found it useful!

</div>

// index.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import { clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
import { User, Meme, Share, Chat } from './db.js'; 
import chatWithDeepSeek from './deepseek.js'; 
import { updateUserSchema, sendSchema } from './type.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(clerkMiddleware());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error(err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// -------------------- Routes --------------------

// ✅ Public route (no auth needed)
app.post('/api/users/create', async (req, res) => {
  try {
    const { clerkId, username, name, email, profilePicture } = req.body;
    let user = await User.findOne({ clerkId });
    if (user) return res.status(200).json(user);

    user = new User({ clerkId, username, email, profilePicture });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Backend: index.js ya routes file
app.get("/profile", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req); // Clerk user ID
    const user = await User.findOne({ clerkId: userId }); // DB lookup
    if (!user) return res.status(404).json({ error: "User not found" });

    // Sirf necessary fields return karo
    res.json({
      user: {
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
      }
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Protected route - requireAuth() added
app.get('/getmessages', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req); 
  const receiverId = req.query.with;
  if (!receiverId) return res.status(400).json({ error: "Receiver ID required" });

  try {
    let chat = await Chat.findOne({ participants: { $all: [userId, receiverId] } })
      .populate('messages.sender', 'username')
      .populate('messages.meme');  // ✅ MEME POPULATE

    if (!chat) return res.json({ messages: [] });

    const simplifiedMessages = chat.messages.map(msg => ({
      username: msg.sender.username,
      text: msg.content,
      type: msg.type,
      meme: msg.meme || null,  // ✅ Ab yeh pura object hoga
      timeStamp: msg.timeStamp
    }));

    res.json({ messages: simplifiedMessages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// ✅ Protected route
app.put('/update', requireAuth(), upload.single("profilePicture"), async (req, res) => {
  const { userId } = getAuth(req);

  const validation = updateUserSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: "Invalid input", details: validation.error.errors });

  const { bio, username } = validation.data; // ✅ name removed
  const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

  const updateFields = { 
    ...(username && { username }), 
    ...(bio && { bio }), 
    ...(imagePath && { profilePicture: imagePath }) 
  }; // ✅ name removed

  try {
    const updatedUser = await User.findOneAndUpdate({ clerkId: userId }, { $set: updateFields }, { new: true });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Protected route
app.get('/search', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const searchUser = await User.findOne({ clerkId: userId }).select('username');
    if (!searchUser) return res.status(404).json({ error: "User not found" });

    res.json({
      message: "User found",
      user: {
        id: searchUser.clerkId,
        username: searchUser.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Protected route
app.get('/chat-search', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Username required" });

  try {
    const searchUsers = await User.find({ username: { $regex: query, $options: 'i' }, clerkId: { $ne: userId } })
      .select('username clerkId');
    res.json({ users: searchUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Protected route
app.get('/recent-chats', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const chats = await Chat.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('participants', 'username profilePicture clerkId')  // ✅ clerkId add kiya
      .populate('messages.sender', 'username profilePicture');

    // ✅ Remove duplicates using Set
    const seenUserIds = new Set();
    
    const recent = chats.map(chat => {
      const friend = chat.participants.find(p => p.clerkId !== userId);
      
      // ✅ Skip if no friend or already seen
      if (!friend || seenUserIds.has(friend.clerkId)) return null;
      
      seenUserIds.add(friend.clerkId);  // ✅ Track seen users

      return {
        userId: friend.clerkId,  // ✅ Use clerkId as userId
        username: friend.username,
        profilePicture: friend.profilePicture,
        messages: chat.messages.map(m => ({
          _id: m._id,
          sender: m.sender,
          content: m.content,
          meme: m.meme || null,
          timeStamp: m.timeStamp
        }))
      };
    }).filter(Boolean);  // ✅ Remove nulls

    res.json({ recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Protected route - FIXED (verifyClerkToken removed)
app.post("/chat", requireAuth(), async(req, res) => {
  const userInput = req.body.message;
  const reply = await chatWithDeepSeek(userInput);
  res.json({ reply });
});

async function fetchAndSaveMemes() {
  try {
    const { data } = await axios.get('https://meme-api.com/gimme/100');
    const incoming = data.memes || [data];

    for (const m of incoming) {
      try {
        await Meme.updateOne(
          { imageUrl: m.url },
          {
            $setOnInsert: {
              title: m.title,
              imageUrl: m.url,
              spoiler: m.spoiler || false,
              nsfw: m.nsfw || false,
              like: [],
              comments: []
            }
          },
          { upsert: true }
        );
      } catch (e) {
        console.warn("Skipping meme:", m.url, e.message);
      }
    }
  } catch (err) {
    console.error('Error fetching memes:', err.message);
  }
}

// ✅ Protected route - FIXED
app.get('/memes', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const limit = parseInt(req.query.limit) || 10;
  const lastId = req.query.lastId;

  let query = {};
  if (lastId) query._id = { $lt: new mongoose.Types.ObjectId(lastId) };

  try {
    const memes = await Meme.find(query).sort({ _id: -1 }).limit(limit);
    const response = memes.map(m => {
      const likeArray = Array.isArray(m.like) ? m.like : [];
      return {
        ...m.toObject(),
        likes: likeArray.length,
        liked: likeArray.some(uid => uid.toString() === userId)
      };
    });

    res.json({ memes: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// ✅ Public route (no auth)
app.get('/refreshMemes', async (_req, res) => {
  await fetchAndSaveMemes();
  res.json({ message: "Memes refreshed" });
});

// ✅ Protected route
app.post('/like', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const id = req.body.id;

  try {
    const meme = await Meme.findById(id);
    if (!meme) return res.status(404).json({ error: "Meme not found" });

    if (!Array.isArray(meme.like)) meme.like = [];
    if (!meme.like.some(uid => uid.toString() === userId)) {
      meme.like.push(userId);
      await meme.save();
    }

    res.json({ message: "Meme liked successfully", likes: meme.like.length, liked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like meme" });
  }
});

// ✅ Protected route
app.post('/unlike', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const id = req.body.id;

  try {
    const meme = await Meme.findById(id);
    if (!meme) return res.status(404).json({ error: "Meme not found" });

    meme.like = meme.like.filter(uid => uid.toString() !== userId);
    await meme.save();

    res.json({ message: "Meme unliked", likes: meme.like.length, liked: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unlike meme" });
  }
});

// ✅ Protected route
app.post('/comment', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  const { id, text } = req.body;

  if (!id || !text?.trim()) return res.status(400).json({ error: "Meme ID and comment text required" });

  try {
    const commentMeme = await Meme.findByIdAndUpdate(
      id,
      { $push: { comments: { user: userId, text } } },
      { new: true }
    );

    if (!commentMeme) return res.status(404).json({ error: "Meme not found" });

    res.json({ message: "Comment added", meme: commentMeme });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Protected route
app.post('/send', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  const validation = sendSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json({ error: "Invalid input", details: validation.error.errors });

  const { receiverId, memeid } = validation.data;

  try {
    const newShare = await Share.create({ sender: userId, receiver: receiverId, meme: memeid });
    res.json({ message: "Meme sent successfully", share: newShare });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Protected route
app.get('/getshared', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);

  try {
    const sharedMemes = await Share.find({ receiver: userId })
      .populate('meme')
      .populate('sender', 'username profilePicture');

    res.json({ shared: sharedMemes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch shared memes' });
  }
});

// -------------------- Socket.IO --------------------
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:5173', methods: ['GET','POST'] } });
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ userId }) => {
    socket.join(userId);
    onlineUsers[userId] = socket.id;
    io.emit("online_users", Object.keys(onlineUsers));
  });

  socket.on("send_message", async (data) => {
    try {
      let chat = await Chat.findOne({ participants: { $all: [data.senderId, data.receiverId] } });
      const messageObj = { sender: data.senderId, content: data.message, type: "text", timeStamp: new Date() };

      if (!chat) chat = new Chat({ participants: [data.senderId, data.receiverId], messages: [messageObj] });
      else chat.messages.push(messageObj);

      await chat.save();

      const receiverSocketId = onlineUsers[data.receiverId];
      if (receiverSocketId) io.to(receiverSocketId).emit("receive_message", messageObj);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("send_meme", async (data) => {
    try {
      let chat = await Chat.findOne({ participants: { $all: [data.senderId, data.receiverId] } });
      const memeObj = { sender: data.senderId, meme: data.meme, type: "meme", timeStamp: new Date() };

      if (!chat) chat = new Chat({ participants: [data.senderId, data.receiverId], messages: [memeObj] });
      else chat.messages.push(memeObj);

      await chat.save();

      const receiverSocketId = onlineUsers[data.receiverId];
      if (receiverSocketId) io.to(receiverSocketId).emit("receive_meme", memeObj);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = onlineUsers[receiverId];
    if (receiverSocketId) io.to(receiverSocketId).emit("typing");
  });

  socket.on("disconnect", () => {
    for (const id in onlineUsers) if (onlineUsers[id] === socket.id) delete onlineUsers[id];
    io.emit("online_users", Object.keys(onlineUsers));
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
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
// ✅ FIXED: Don't overwrite profilePicture if user exists
app.post('/api/users/create', async (req, res) => {
  try {
    const { clerkId, username, email, profilePicture } = req.body;
    let user = await User.findOne({ clerkId });
    
    if (user) {
      // ✅ User already exists - DON'T update profilePicture
      console.log("✅ User exists, not updating profile pic");
      return res.status(200).json(user);
    }

    // ✅ New user - only set profilePicture if provided
    user = new User({ 
      clerkId, 
      username, 
      email,
      ...(profilePicture && { profilePicture }) // Only if provided
    });
    
    await user.save();
    console.log("✅ New user created");
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/profile", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

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

// ✅ FIXED: /getmessages - Added sender field
app.get('/getmessages', requireAuth(), async (req, res) => {
  const { userId } = getAuth(req); 
  const receiverId = req.query.with;
  if (!receiverId) return res.status(400).json({ error: "Receiver ID required" });

  try {
    let chat = await Chat.findOne({ participants: { $all: [userId, receiverId] } })
      .populate('messages.sender', 'username clerkId')
      .populate('messages.meme');

    if (!chat) return res.json({ messages: [] });

    const simplifiedMessages = chat.messages.map(msg => ({
      sender: msg.sender.clerkId || msg.sender,  // ✅ FIXED: Added sender
      username: msg.sender.username || "Unknown",
      text: msg.content,
      type: msg.type,
      meme: msg.meme || null,
      timeStamp: msg.timeStamp
    }));

    res.json({ messages: simplifiedMessages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.put('/update', requireAuth(), upload.single("profilePicture"), async (req, res) => {
  const { userId } = getAuth(req);
  
  console.log("=== UPDATE REQUEST ===");
  console.log("📸 File received:", req.file);
  console.log("📝 Body received:", req.body);
  console.log("👤 User ID:", userId);

  const { bio, username } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

  console.log("🖼️ Image path:", imagePath);

  const updateFields = {};
  if (username) updateFields.username = username;
  if (bio) updateFields.bio = bio;
  if (imagePath) updateFields.profilePicture = imagePath;

  console.log("💾 Update fields:", updateFields);

  try {
    const beforeUpdate = await User.findOne({ clerkId: userId });
    console.log("📋 BEFORE update:", beforeUpdate?.profilePicture);

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId }, 
      { $set: updateFields }, 
      { new: true }
    );
    
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    console.log("✅ AFTER update:", updatedUser.profilePicture);
    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
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

app.get('/recent-chats', requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const chats = await Chat.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('participants', 'username profilePicture clerkId email')  // ✅ Added email
      .populate('messages.sender', 'username profilePicture clerkId')
      .populate('messages.meme');

    const seenUserIds = new Set();
    
    const recent = chats.map(chat => {
      const friend = chat.participants.find(p => p.clerkId !== userId);
      
      if (!friend || seenUserIds.has(friend.clerkId)) return null;
      
      seenUserIds.add(friend.clerkId);

      return {
        userId: friend.clerkId,
        clerkId: friend.clerkId,  // ✅ Added for compatibility
        username: friend.username,
        profilePicture: friend.profilePicture,
        email: friend.email || '',  // ✅ Added email
        messages: chat.messages.map(m => ({
          _id: m._id,
          sender: m.sender?.clerkId || m.sender,  // ✅ FIX: Handle populated object
          senderUsername: m.sender?.username || 'Unknown',  // ✅ Added
          content: m.content,
          meme: m.meme || null,
          timeStamp: m.timeStamp
        }))
      };
    }).filter(Boolean);

    console.log('📤 Sending recent chats:', recent);  // ✅ Debug log
    res.json({ recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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

app.get('/refreshMemes', async (_req, res) => {
  await fetchAndSaveMemes();
  res.json({ message: "Memes refreshed" });
});

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

  // ✅ FIXED: send_message - Added senderId in emit
  socket.on("send_message", async (data) => {
    try {
      let chat = await Chat.findOne({ participants: { $all: [data.senderId, data.receiverId] } });
      const messageObj = { 
        sender: data.senderId, 
        content: data.message, 
        type: "text", 
        timeStamp: new Date() 
      };

      if (!chat) chat = new Chat({ participants: [data.senderId, data.receiverId], messages: [messageObj] });
      else chat.messages.push(messageObj);

      await chat.save();

      const receiverSocketId = onlineUsers[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", {
          ...messageObj,
          senderId: data.senderId  // ✅ FIXED: Added senderId
        });
      }
    } catch (err) {
      console.error(err);
    }
  });

  // ✅ FIXED: send_meme - Added senderId in emit
  socket.on("send_meme", async (data) => {
    try {
      let chat = await Chat.findOne({ participants: { $all: [data.senderId, data.receiverId] } });
      const memeObj = { 
        sender: data.senderId, 
        meme: data.meme, 
        type: "meme", 
        timeStamp: new Date() 
      };

      if (!chat) chat = new Chat({ participants: [data.senderId, data.receiverId], messages: [memeObj] });
      else chat.messages.push(memeObj);

      await chat.save();

      const receiverSocketId = onlineUsers[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_meme", {
          ...memeObj,
          senderId: data.senderId  // ✅ FIXED: Added senderId
        });
      }
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
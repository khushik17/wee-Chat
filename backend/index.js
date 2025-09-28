const express = require('express');
const axios = require('axios');
const multer = require("multer");
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();
const { sendOtp, verifyOtp } = require('./twilio') ;
const app = express();
exports.app = app;
app.use(express.json());
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const chatWithDeepSeek = require("./deepseek");

const rateLimit = require('express-rate-limit');
const cors = require('cors');
app.use(cors({
     origin: 'http://localhost:5173', 
    credentials: true
}));
const { createUserSchema, updateUserSchema, loginSchema, sendSchema } = require('./type');
const { Signup, Data, Meme, Share, Chat } = require('./db');
const userMiddleware = require('./middleware');
const jwtMiddleware = require('./jwtmiddleware');
const jwt = require('jsonwebtoken');
const jwtSecret =process.env.JWT_SECRET;
const otpLimiter = rateLimit({
    windowMs: 1*60*1000,
    max: 3,
    message: "Too many requests, please try again later after 1 minute"
});
const loginLimiter = rateLimit({
    windowMs: 1*60*1000,
    max: 5,
    message: "Too many login attempts, please try again later after 1 minute"
});

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); 
    cb(null, Date.now() + ext);
  }
})
const upload = multer({ storage: storage });

app.post('/signup', async(req, res)=>{
const input = req.body;
const validation = createUserSchema.safeParse(input);
if(!validation.success){
     console.log("Validation Errors:", validation.error); 
    return res.status(400).json({
        error: "Invalid input"
    })
}
try {
    const userData = await Data.create({
        email: input.email,
        password: input.password,
        username: input.username,
       }
    );

    const newUser = await Signup.create({
        name: input.name,
        phone: input.phone,
        Common: [userData._id],
    });
      const token = jwt.sign({ username: input.username, id: userData._id}, jwtSecret);
    res.json({
        message: "User created successfully",
        token: token,
    });
} catch (error) {
    console.log(error);
    res.status(500).json({
        error: "Internal server error"
    });
   
}
});

app.post('/login',loginLimiter, async(req,res)=>{
    const input =req.body;
    const validation = loginSchema.safeParse(input);
    if(!validation.success){
    return res.status(400).json({
        error: "Invalid input"
    })}
    try { const user = await Data.findOne({
        username: input.username,
        password: input.password        
    })
    if(!user){
        return res.status(401).json({
            error: "Invalid username or password"
        });}
     const token = jwt.sign({ username: input.username, id: user._id }, jwtSecret);
     return res.json({
            message: "Login successful",
            token: token
        });
    }catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});
app.get("/profile", jwtMiddleware, async (req, res) => {
  try {
    const user = await Data.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

   app.get('/getmessages', jwtMiddleware, async (req, res) => {
  const senderId = req.user.id;
  const receiverId = req.query.with;
  if (!receiverId) return res.status(400).json({ error: "Receiver ID required" });
  try {
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate('messages.sender', 'username');
     if (!chat) return res.json({ messages: [] });
       const simplifiedMessages = chat.messages.map(msg => ({
      username: msg.sender.username,
      text: msg.content
    }));

    res.json({ messages: simplifiedMessages });
  }catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});


app.post('/otpSMS',otpLimiter, async (req,res)=>{
const {phone} = req.body;
if(!phone){
    return res.status(400).json({
        error: "Phone number is required"
    });}
    try{
        const response = await sendOtp(phone);
        res.json({
            message: "OTP sent successfully",
            sid: response.sid
        });
    } catch (error) {
    console.error("OTP send error:", error); 
    return res.status(500).json({
        error: "Failed to send OTP"
    });
}

        })

app.post('/otpVerify',otpLimiter, async(req,res)=>{
    const {phone, otp} = req.body;
    if(!phone || !otp){
        return res.status(400).json({
            error: "Phone number and OTP are required"
        });
    }
    try{
const response = await verifyOtp(phone, otp);
 if(response.status!== 'approved'){
    res.status(400).json({
        error: "Invalid OTP"        
    })}
    else{
        res.json({  
            message: "OTP verified successfully",
            status: response.status
        });
    }} catch (error) {
        return res.status(500).json({
            error: "Failed to verify OTP"
        });
    }
})
app.put('/update', jwtMiddleware, upload.single("profilePicture"), async (req, res) => {
  const { name, bio , username} = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const updateFields = {
      ...(name && { name }),
      ...(username && { username }),
      ...(bio && { bio }),
      ...(imagePath && { profilePicture: imagePath }),
    };

    const updatedUser = await Data.findOneAndUpdate(
       { _id: req.user.id },
      { $set: updateFields },
      { new: true }
    )

    res.json({
      message: "Profile updated",
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get('/search', jwtMiddleware, async(req,res)=>{
const userId = req.user.id;
try{
  const searchUser = await Data.findById(userId).select('username')

if(!searchUser){
    return res.status(404).json({
        error: "User not found"
    })}
res.json({
    message: "User found",
user: {
        id: searchUser._id.toString(),
        username: searchUser.username
      }
});}
    catch(error){
        return res.status(500).json({
            error: "Internal server error"
        });
    }

})
app.get('/chat-search', jwtMiddleware, async (req, res) => {
  const query = req.query.q;
  console.log("Search query:", query);
  if (!query) return res.status(400).json({ error: "Username required" });

  try {
    const searchUsers = await Data.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id }
    }).select('username _id');

    res.json({ users: searchUsers });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
 
app.get('/recent-chats', jwtMiddleware, async (req, res) => {
  const userId = req.user.id;
  const chats = await Chat.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate('participants', 'username');

  const recent = chats.map(chat => {
    const friend = chat.participants.find(p => p._id.toString() !== userId);
    return { userId: friend._id, username: friend.username };
  });

  res.json({ recent });
});


app.post("/chat", async (req, res) => {
      console.log("Chat endpoint hit");
  console.log("Headers received:", req.headers);
  const userInput = req.body.message;
  const reply = await chatWithDeepSeek(userInput);
  res.json({ reply });
});
async function fetchAndSaveMemes() {
  try {
    const { data } = await axios.get('https://meme-api.com/gimme/100');
    const incoming = data.memes || [data];       
        console.log("API returned:", incoming.length);
    const toInsert = [];

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
    console.warn("Fetch fail → skipping:", m.url, e.message);
  }
}


  } catch (err) {
    console.error(' Error in fetchAndSaveMemes:', err.message);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
app.get('/memes', jwtMiddleware, async (req, res) => {
   
  const limit  = parseInt(req.query.limit) || 10;
  const lastId = req.query.lastId;          
const userId = req.user.id;
                                   
 let query = {};
  if (lastId) {
    try {
      query._id = { $lt: new mongoose.Types.ObjectId(lastId) };
    } catch (e) {
      return res.status(400).json({ error: "Invalid lastId" });
    }
  }
  try {
    const memes = await Meme.find(query)
      .sort({ _id: -1 })                    
      .limit(limit);
const response = memes.map(m => {
  const likeArray = Array.isArray(m.like) ? m.like : []; 

  return {
    ...m.toObject(),
    likes: likeArray.length,
     liked: likeArray.some(uid => uid.toString() === req.user.id)
  };
});

    res.json({ memes: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/refreshMemes', async (_req, res) => {
  const result = await fetchAndSaveMemes();  

  if (result.success) {
    res.json({ message: `Saved ${result.memes.length} new memes` });
  } else {
    res.status(500).json({ error: result.error });
  }
});


setInterval(async () => {
  console.log(" Auto-fetching fresh memes...");
  await fetchAndSaveMemes();
}, 60 * 60 * 1000);

app.post('/like',jwtMiddleware, async (req, res) => {
    const userId = req.user.id;
    const id = req.body.id;

    try {
      
        const meme = await Meme.findById(id);
        if (!meme) return res.status(404).json({ error: "Meme not found" });

      if (!Array.isArray(meme.like)) {
      meme.like = [];
    }
        if (!meme.like.some(uid => uid.toString() === userId)) {
            meme.like.push(new mongoose.Types.ObjectId(userId));
            await meme.save();
        }

        res.json({
            message: "Meme liked successfully",
            likes: meme.like.length, 
            liked: true               
        });

    } catch (error) {
        console.error("Error liking meme:", error);
        res.status(500).json({ error: "Failed to like meme" });
    }
});


     app.post('/comment',async(req,res)=>{
       console.log("post /comment hit");
        console.log("Request body:", req.body);
        const {id,text} = req.body;
         
         if (!id || !text?.trim()) {
        return res.status(400).json({ error: "Meme ID and comment text are required" });
    }

       try{
        const commentMeme = await Meme.findByIdAndUpdate(
            id,
          {$push:{comments:{text}}},
          {new: true}
        );
        if(!commentMeme){
        return res.status(404).json({ error: "Meme not found" });
     }
     res.json({
       message: "Meme commented successfully",
      meme: commentMeme
     })
       }catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
     })

     app.post('/send',jwtMiddleware,async(req,res)=>{
       const {receiverId, memeid} = req.body;
       console.log("Received body:", req.body);
      const validation = sendSchema.safeParse({receiverId, memeid})
      if (!validation.success) {
  return res.status(400).json({ error: "Invalid input", details: validation.error.errors });
}try{
    const newShare =await Share.create({
    sender: req.user.id,
      receiver: receiverId,
      meme: memeid,
    })
     res.json({ message: "Meme sent successfully", share: newShare });
}catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }

     })
     app.post('/unlike', jwtMiddleware, async (req, res) => {
      const userId = req.user.id;
  const id = req.body.id;
  try {
    const meme = await Meme.findById(id);
       if (!meme){ return res.status(404).json({ error: "Meme not found" })};

   meme.like = meme.like.filter(uid => uid.toString() !== userId);
        await meme.save();
    res.json({ message: "Meme unliked",
      likes: meme.like.length,     
    liked: false 
    });
 
  }
   catch (error) {
    console.error("Error unliking meme:", error);
    res.status(500).json({ error: "Failed to unlike meme" });
  }
});
app.get('/getshared', jwtMiddleware, async (req, res) => {
  try {
    const sharedMemes = await Share.find({ receiver: req.user.id })
      .populate('meme')
      .populate('sender', 'username');  
    res.json({ shared: sharedMemes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shared memes' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Store online users
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with userId
  socket.on("join", ({ userId }) => {
    socket.join(userId); // join personal room
    onlineUsers[userId] = socket.id; // track online
    console.log(`User ${userId} joined their room`);

    // Send updated online users list to everyone
    io.emit("online_users", Object.keys(onlineUsers));
  });

  // Handle message sending
  socket.on("send_message", async (data) => {
    console.log("Received:", data);
    const senderId = new mongoose.Types.ObjectId(data.senderId);
    const receiverId = new mongoose.Types.ObjectId(data.receiverId);

    try {
      let chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] }
      });

      if (!chat) {
        chat = new Chat({
          participants: [senderId, receiverId],
          messages: [{ sender: senderId, content: data.message }]
        });
        await chat.save();
      } else {
        chat.messages.push({ sender: senderId, content: data.message });
        await chat.save();
      }

      console.log("Chat updated:", chat);

      // Send message to receiver if online
      const receiverSocketId = onlineUsers[String(data.receiverId)];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", data);
      }

    } catch (err) {
      console.error("Chat update failed:", err);
    }
  });
   socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = onlineUsers[String(receiverId)];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing");
    }
  });

  // On disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove from onlineUsers
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }

    io.emit("online_users", Object.keys(onlineUsers));
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

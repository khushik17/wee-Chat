import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ User Schema - Keep clerkId as primary identifier
const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    email: String,
    bio: String,
    profilePicture: String,
    likedMemes: [{ type: String }], // ✅ Store meme IDs as strings
}, { timestamps: true });

// ✅ Message Schema - Use String for sender (clerkId)
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // ✅ Clerk ID string
  type: { type: String, enum: ["text", "meme"], required: true },
  content: { 
    type: String, 
    required: function() { return this.type === "text"; } 
  },
  meme: { type: Schema.Types.ObjectId, ref: "Meme" }, // Meme ObjectId is fine
  timeStamp: { type: Date, default: Date.now }
});

// ✅ Chat Schema - Use String for participants
const chatSchema = new mongoose.Schema({
  participants: [{ type: String }], // ✅ Clerk IDs
  messages: [messageSchema]
}, { timestamps: true });

// ✅ Meme Schema - Use String for likes and comments
const memeSchema = new mongoose.Schema({
    title: String,
    imageUrl: { type: String, required: true, unique: true }, 
    spoiler: Boolean,
    nsfw: Boolean,
    like: {
      type: [String], // ✅ Array of Clerk IDs
      default: []
    },
    comments: [{
        user: { type: String }, // ✅ Clerk ID
        text: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
    }]
});

// ✅ Shared Meme Schema - Use String for users
const sharedmemeSchema = new mongoose.Schema({
    sender: { type: String }, // ✅ Clerk ID
    receiver: { type: String }, // ✅ Clerk ID
    meme: { type: Schema.Types.ObjectId, ref: "Meme" },
    sentAt: {
      type: Date,
      default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);
const Meme = mongoose.model('Meme', memeSchema);
const Share = mongoose.model('Share', sharedmemeSchema);
const Chat = mongoose.model('Chat', chatSchema);

export { User, Meme, Share, Chat };
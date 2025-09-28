require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log(' MongoDB connected'))
.catch((err) => console.error(' MongoDB connection error:', err));

const userSignupSchema =  new mongoose.Schema({
    name: String,
    phone: String,
    Common:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Data'
    }],
    otp: Number,
    likedMemes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meme" }]

});

const messageSchema = new mongoose.Schema({
    sender: {type:Schema.Types.ObjectId, ref:"Data", required:true},
    content:{type: String, required: true},
    timeStamp:{type:Date, default:Date.now}
});

const chatSchema = new mongoose.Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'Data' }],
     messages: [messageSchema]
})
const dataSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    name: String,
    phone: String,
    bio: String,
    profilePicture: String 
});

const memeSchema = new mongoose.Schema({
    title: String,
    imageUrl:{type: String, required:true, unique:true}, 
    spoiler: Boolean,
    nsfw: Boolean,
    like: {
  type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
default:[]
},

    comments: [{
        user: { type: Schema.Types.ObjectId, ref: 'Data' },
       text: String,
       createdAt: {
        type: Date,
        default: Date.now
       }
    }]
})
const sharedmemeSchema = new mongoose.Schema({
    sender:{type: mongoose.Schema.Types.ObjectId , ref: 'Data'},
    receiver:{type: mongoose.Schema.Types.ObjectId , ref: 'Data'},
  meme: { type: mongoose.Schema.Types.ObjectId, ref: "Meme" }
  ,sentAt: {
    type: Date,
    default: Date.now,
  },
});
const Signup = mongoose.model('Signup', userSignupSchema);
const Data =  mongoose.model('Data',dataSchema);
const Meme = mongoose.model('Meme', memeSchema);
const Share = mongoose.model('Share', sharedmemeSchema)
const Chat = mongoose.model('Chat',chatSchema)
module.exports = {
    Signup,
    Data,
    Meme,
    Share,
    Chat
}
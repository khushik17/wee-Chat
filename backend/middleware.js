const {Data} = require('./db');

function userMiddleware(req,res,next){
const username= req.headers.username;
const password = req.headers.password;

if (!(username && password)) {
    return res.status(400).json({ error: "Username and password required" });
}

Data.findOne({
    username: username,
    password: password
})
.then((value)=>{
    if(value){
        next();
    } else{
        res.status(401).json({
            error: "Unauthorized access"
        });
    }
})
}
module.exports = userMiddleware;

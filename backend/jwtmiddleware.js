 const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

 
 function jwtMiddleware(req,res,next){
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);
    if(!authHeader){
        return res.status(401).json({
            error: "Token required"
        });
    }
     const token = authHeader.split(' ')[1];
      console.log("Extracted Token:", token); 

    try{
        const decoded = jwt.verify(token, jwtSecret);
        req.user= decoded;
        next();
    }catch(error){
         console.error("JWT verification failed:", error.message);
        return res.status(401).json({
            error: "Invalid token"

        });
    }
 }
 module.exports = jwtMiddleware;
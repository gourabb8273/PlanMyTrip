require('dotenv').config();

const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY;
const requiredAuth = (req, res, next) =>{
    try {      
        const token = req.headers && req.headers.token;        
        if (!token) res.status(400).json({ message: "Token not found, Please provide a valid token" });
        jwt.verify(token, secretKey);        
        next();
      } catch (error) {
        console.log(`Error while processing authentication middleware ${error}`);
        next({message:`Error while processing authentication middleware `, error})        
      }
}

module.exports = requiredAuth;
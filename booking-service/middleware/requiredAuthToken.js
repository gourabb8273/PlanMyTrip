require('dotenv').config();
const jwt = require("jsonwebtoken");

const logger = require("../logger");

const apiTokenSecretKey = process.env.API_TOKEN_SECRET_KEY;
const apiToken = process.env.API_TOKEN_KEY

/**
 * MiddleWare for verifying token while communicating with in micro services
 * API_TOKEN_KEY - apiToken is static where one can call from post man using that
 * API_TOKEN_SECRET_KEY - With in microservice communication is happening using jwt token need to verify it's signature
 */
const requiredAuthToken = (req, res, next) =>{
    try {      
        const token = req.headers && req.headers.token;        
        if (!token) return res.status(400).json({ message: "Token not found, Please provide a valid token" });             
        apiToken == token || jwt.verify(token, apiTokenSecretKey);                 
        next();
      } catch (error) {
        logger.error(`Error while processing authentication middleware ${JSON.stringify(error)}`);
        next({message:`Error while processing authentication middleware, Please provide a valid token `, error});           
      }
}

module.exports = requiredAuthToken;
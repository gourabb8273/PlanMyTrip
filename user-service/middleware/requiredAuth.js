require('dotenv').config();

const logger = require("../logger");

const jwt = require("jsonwebtoken");

/**
 * MiddleWare for verifying a registered user
 * JWT_SECRET_KEY - Secret key will be used for validating signature
 */

const secretKey = process.env.JWT_SECRET_KEY;
const requiredAuth = (req, res, next) =>{
    try {      
        const token = req.headers && req.headers.token;           
        if (!token) res.status(400).json({ message: "Token not found, Please provide a valid token" });
        const verifypayload = jwt.verify(token, secretKey);     
        req.username = verifypayload.username;
        req.email = verifypayload.email;
        req.phone = verifypayload.phone;
        req.role = verifypayload.role;   
        req.id = verifypayload.id;           
        next();
      } catch (error) {
        logger.error(`Error while processing authentication middleware ${JSON.stringify(error)}`);
        next({message:`Error while processing authentication middleware `, error})        
      }
}

module.exports = requiredAuth;
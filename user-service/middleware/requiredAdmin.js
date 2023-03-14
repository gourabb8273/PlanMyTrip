const jwt = require("jsonwebtoken");

const userRoles = require("../constant/userRole");
const logger = require("../logger");

const secretKey = process.env.JWT_SECRET_KEY;

/**
 * MiddleWare for verifying admin role of a user
 * JWT_SECRET_KEY - Secret key will be used for validating signature
 */
const requiredAdmin = (req, res, next) => {
  try {
    const token = req.headers && req.headers.token;
    if (!token)
      res
        .status(400)
        .json({ message: "Token not found, Please provide a valid token" });
    const verifypayload = jwt.verify(token, secretKey);
    const role = verifypayload && verifypayload.role === userRoles.ADMIN;
    if (!role)
      return res
        .status(400)
        .json({ message: "This endpoint is not available for the given role" });
    req.username = verifypayload.username;
    req.email = verifypayload.email;
    req.role = verifypayload.role;
    next();
  } catch (error) {
    logger.error(`Error while processing admin middleware ${JSON.stringify(error)}`);
    return res
      .status(400)
      .json({ message: "Please authenticate with a valid token", error });
  }
};

module.exports = requiredAdmin;

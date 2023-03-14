const express = require("express");
const fs = require("fs");
const path = require("path");
const { v1: uuidv1 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const userInfoPath = path.join(process.cwd(), "models/user.json");
const secretKey = process.env.JWT_SECRET_KEY;
const apiTokenSecretKey = process.env.API_TOKEN_SECRET_KEY;
const logger = require("../logger");

const validateEmail = (email) => {
  var emailCheck =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
  return !!emailCheck.test(email);
};

const validatePhoneNumber = (phone) => {
  var phoneCheck = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
  return phoneCheck.test(phone);
};

/**
 * Registering user credential
 */
router.post("/", async (req, res, next) => {
  if (!req.body) return res.status(400).send("Invalid request body");

  const { username, email, password, role, phone } = req.body;
  try {
    //check whether entered credentials is valid
    if (!username)
      return res.status(400).json({
        message: "Invalid request body: Please provide a username",
      });
    if (!password)
      return res.status(400).json({
        message: "Invalid request body: Please provide a password",
      });

    if (!phone)
      return res
        .status(400)
        .json({ message: "Invalid request body: Please provide a phone" });

    if (!email)
      return res
        .status(400)
        .json({ message: "Invalid request body: Please provide an email" });

    if (!role)
      return res
        .status(400)
        .json({ message: "Invalid request body: Please provide valid role" });

    //validate an email
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid request body: Please provide a valid email",
      });
    }

    //validate phone number
    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({
        message: "Invalid request body: Please provide a valid phone number",
      });
    }
    //check whether existing user
    const userData = JSON.parse(await fs.readFileSync(userInfoPath));
    const isUserExists = !!(
      userData && userData.find((user) => user.username === username)
    );
    if (isUserExists)
      return res
        .status(400)
        .json({ message: `${username} is already exists! Please sign in.` });

    const isEmailExists = !!(
      userData && userData.find((user) => user.email === email)
    );
    if (isEmailExists)
      return res.status(400).json({
        message: `Email ${email} is already exist! Please use a different email.`,
      });

    //create user info
    const userId = uuidv1();
    const createdAt = new Date();
    const updatedAt = new Date();

    //encrypting password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {
      id: userId,
      username,
      password: hashedPassword,
      createdAt,
      updatedAt,
      phone,
      email,
      role,
    };
    userData.push(user);
    fs.writeFileSync(userInfoPath, JSON.stringify(userData), (err) => {
      if (err) throw err;
      logger.info(`user is saved successfully ${JSON.stringify(user)}`);
    });

    //generating jwt token
    const token = jwt.sign(
      {
        id: userId,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
      secretKey
    );

    //storing notification type this should come from UI
    const type = ["In-App", "Email", "Sms", "Push"];
    const notifyUser = {
      id: userId,
      email,
      phone,
    };
    const notificationPayload = {
      message: `${username} has registered successfully`,
      type,
      user: notifyUser,
    };

    //generating api token to communicate microservices (Payment service and notification service)
    const apiToken = jwt.sign({ user }, apiTokenSecretKey);
    const config = { headers: { token: apiToken } };

    logger.info(`${JSON.stringify(username)} has registered successfully`);
    return res
      .status(201)
      .json({ message: `${username} is registered successfully`, token, user });
  } catch (error) {
    logger.error(`Error while registering user ${JSON.stringify(error)}`);
    return res
      .status(500)
      .json({ message: `Something went wrong while registering user`, error });
  }
});

module.exports = router;

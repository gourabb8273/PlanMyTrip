const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const router = express.Router();
const userInfoPath = path.join(process.cwd(), "models/user.json");
const secretKey = process.env.JWT_SECRET_KEY;
const logger = require("../logger");

/**
 * Login user credential
 */
router.post("/", async (req, res, next) => {
  if (!req.body)
    return res.status(400).json({ message: "Invalid request body" });
  const { email, password } = req.body;
  try {
    //check whether entered credentials is valid
    if (!email)
      return res
        .status(400)
        .json({ message: "Invalid request body: Please provide valid email" });
    if (!password)
      return res.status(400).json({
        message: "Invalid request body: Please provide valid password",
      });

    //check whether user exists or not
    const userData = JSON.parse(await fs.readFileSync(userInfoPath));
    const user = userData && userData.find((user) => user.email === email);
    if (!user)
      return res.status(404).json({
        message: `User with email ${email} doesn't exists! Please signup first.`,
      });

    //Validate the password
    const matchedPassword = await bcrypt.compare(password, user.password);

    if (!matchedPassword)
      return res.status(400).json({
        message: `Invalid Credentials! Please enter the correct password`,
      });
    //generating jwt token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
      secretKey
    );
    logger.info(`Log in is successful ${JSON.stringify(user)}`);
    return res.status(201).json({ message: `Log in is successful`, token, user });
  } catch (error) {
    logger.error(`Error while logging in user ${JSON.stringify(error)}`);
    return res
      .status(500)
      .json({ message: `Something went wrong while logging in user`, error });
  }
});

module.exports = router;

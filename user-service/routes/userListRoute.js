const express = require("express");
const fs = require("fs");
const path = require("path");

const requiredAdmin = require("../middleware/requiredAdmin");

const router = express.Router();
const userInfoPath = path.join(process.cwd(), "models/user.json");
const logger = require("../logger");

/**
 * Showing all users
 */
router.get("/", requiredAdmin, async (req, res, next) => {
  try {
    const userData = JSON.parse(await fs.readFileSync(userInfoPath));
    logger.info( `User lists are fetchched successfully`);
    return res
      .status(201)
      .json({
        message: `User lists are fetchched successfully`,
        data: userData
      });
  } catch (error) {
    logger.error(`Error while showing a list of users ${JSON.stringify(error)}`);
    return res
      .status(500)
      .json({ message: `Something went wrong while showing a list of users` });
  }
});

module.exports = router;

const express = require("express");
const fs = require("fs");
const path = require("path");
const { v1: uuidv1 } = require("uuid");

const router = express.Router();
const notificationType = require("../constant/notificationType");
const notificationPath = path.join(process.cwd(), "models/notification.json");
const requiredAuthToken = require("../middleware/requiredAuthToken");
const logger = require("../logger");

/**
 * Send notification to the user 
 * Middleware: need api token to authenticate
 * Description: We are sending notification based on selected type like email, sms, push or In App
 * API Endpoint Example = /api/notify
 */
router.post("/", requiredAuthToken, async (req, res, next) => {
  try {
    const { message, type, user } = req.body;   
    if (!message)
      return res
        .status(404)
        .json({ message: `Please provide a notificaton message` });

    if (!type)
      return res
        .status(404)
        .json({ message: `Please provide a notification type` });

    if (!user || !user.id)
      return res.status(404).json({ message: `Please provide a user and id` });

    //sending in app notification
    if (type.includes(notificationType.INAPP))
      logger.info(`Send in-APP notification successfully  ${user.email}`);

    //sending email notification
    if (type.includes(notificationType.EMAIL)) {
      if (!user.email)
        return res.status(404).json({ message: `Please provide a user email` });
      logger.info(`Send email notification successfully ${user.email}`);
    }
    //sending sms notification
    if (type.includes(notificationType.SMS)) {
      if (!user.phone)
        return res
          .status(404)
          .json({ message: `Please provide a user phone number` });
      logger.info(`Send sms notification successfully  ${user.email}`);
    }
    //sending push notification
    if (type.includes(notificationType.PUSH))
      logger.info(`Send push notification successfully  ${user.email}`);

    //storing notification in database
    const id = uuidv1();
    const createdAt = new Date();

    const notificationData = JSON.parse(
      await fs.readFileSync(notificationPath)
    );
    const newNotification = {
      id,
      createdAt,
      userId: user.id,
      notificationMessage: message,
      type,
    };
    notificationData.push(newNotification);
    res.status(201).json({
      message: `Notification send successfully`,
      response: newNotification,
    });
  } catch (error) {
    logger.info(`Error while sending notification ${JSON.stringify(error)}`);
   return  res.status(500).json({
      message: `Something went wrong while sending notification ${error}`,
    });
  }
});

module.exports = router;

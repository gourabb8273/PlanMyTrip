const express = require("express");
const fs = require("fs");
const path = require("path");
const { v1: uuidv1 } = require("uuid");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const router = express.Router();
const paymentStatus = require("../constant/paymentStatus");
const paymentPath = path.join(process.cwd(), "models/payment.json");
const requiredAuthToken = require("../middleware/requiredAuthToken");
const logger = require("../logger");
const apiTokenSecretKey = process.env.API_TOKEN_SECRET_KEY;

//Make the payemnt and return transaction id and status
const makePayment = ({ bookingId, userId, bookingType, paymentData }) => {
  if (bookingId && userId && bookingType && paymentData) {
    //assuming payment is done
    return {
      status: "success",
      invoiceId: uuidv1(),
      createdAt: new Date(),
      message: paymentStatus.SUCCESS,
    };
  } else {
    //if payment is failed
    return {
      status: "failed",
      invoiceId: uuidv1(),
      createdAt: new Date(),
      message: paymentStatus.FAIL,
    };
  }
};

/**
 * Making payment for a  booking order
 * Middleware: need an api token to authenticate
 * Description: We are making payment and sending notification to the user
 * API Endpoint Example = /api/payment/:bookingId
 */
router.post("/:bookingId", requiredAuthToken, async (req, res, next) => {
  try {
    const { user, bookingType, paymentData } = req.body;
    const { bookingId } = req.params;
    if (!user && !user.id && !user.email && !user.phone)
      return res.status(404).json({ message: `Please provide user details` });

    if (!bookingId)
      return res
        .status(404)
        .json({ message: `Please provide a booking id for payment` });
    if (!bookingType)
      return res
        .status(404)
        .json({ message: `Please provide a booking type for payment` });
    if (
      !paymentData ||
      !paymentData.modeOfTransaction ||
      !paymentData.bankName ||
      !paymentData.bankCode ||
      !paymentData.accountNumber
    )
      return res
        .status(404)
        .json({ message: `Please provide valid payment data` });
    //making the actual payment
    const { status, invoiceId, createdAt, message } = makePayment({
      bookingId,
      userId: user.id,
      bookingType,
      paymentData,
    });
    const paymentInfo = JSON.parse(await fs.readFileSync(paymentPath));
    const newInvoice = {
      invoiceId,
      status,
      bookingId,
      userId: user.id,
      bookingType,
      paymentData,
      createdAt,
    };

    paymentInfo.push(newInvoice);
    // storing Payment in database
    //check later
    // fs.writeFileSync(
    //   path.join(process.cwd(), "models/payment.txt"),
    //   JSON.stringify(paymentInfo),
    //   (err) => {
    //     if (err) {
    //       logger.info(JSON.stringify(err));
    //       throw err;
    //     }
    //     logger.info(
    //       `Payment is saved successfully ${JSON.stringify(newInvoice)}`
    //     );
    //   }
    // );

    // sending notification to user
    const type = ["In-App", "Email", "Sms", "Push"];
    const notificationPayload = {
      message,
      type,
      user,
    };
    //generating api token to communicate microservices (Payment service and notification service)
    const apiToken = jwt.sign({ user }, apiTokenSecretKey);
    const config = {
      headers: {
        token: apiToken,
      },
    };

    let notificationService;
    try {
      //Service Discovery - get the notification service from Service Registry
      notificationService = await axios.get(
        "http://service-registry:8084/api/find/notification-service/1.0.0"
      );
    } catch (error) {
      logger.info(
        "Notification service not found in registry please register first with /registry/api/register/notification-service/1.0.0/8085"
      );
    }

    if (!notificationService.data)
      return res.status(404).json({
        message:
          "Notification service not found in registry please register first with /registry/api/register/notification-service/1.0.0/8085",
      });
    let name = notificationService.data.name;
    let port = notificationService.data.port;
    if (!(name && port))
      return res.status(404).json({
        message:
          "Notification service details not found in registry please register first with /registry/api/register/notification-service/1.0.0/8085",
      });
    const notificationURL = `http://${name}:${port}/api/notify`;
    await axios.post(notificationURL, notificationPayload, config);

    return res.status(201).json({
      message,
      response: newInvoice,
    });
  } catch (error) {
    logger.error(`Error while making payment ${JSON.stringify(error)}`);
    res
      .status(500)
      .json({ message: `Something went wrong while making payment`, error });
  }
});

module.exports = router;

const express = require("express");
const fs = require("fs");
const path = require("path");
const { v1: uuidv1 } = require("uuid");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const router = express.Router();
const bookingTypes = require("../constant/bookingType");
const flightNotificationStatus = require("../constant/flightNotificationStatus");
const bookingStatus = require("../constant/bookingStatus");
const flightInfoPath = path.join(process.cwd(), "models/flight.json");
const flightBookingPath = path.join(process.cwd(), "models/flightBooking.json");
const requiredAuthToken = require("../middleware/requiredAuthToken");
const logger = require("../logger");
const apiTokenSecretKey = process.env.API_TOKEN_SECRET_KEY;

/**
 * Booking a flight
 * Middleware:
 *       need an api token to authenticate b/w microservces from postman API_TOKEN_KEY
 *       need a jwt token for authenticating valid user (communication within microservices)
 * Description: We are booking a flight or hotel for a user
 * API Endpoint Example = /api/flight/S5G5S6DFS63S
 */
router.post("/:flightId", requiredAuthToken, async (req, res, next) => {
  try {
    const { user, bookingType, departure, arrival, paymentData } = req.body;
    const { flightId } = req.params;
    if (!flightId)
      return res
        .status(404)
        .json({ message: `Please provide a valid flight for booking` });

    // get the flight according to flightid
    let flightInfo = JSON.parse(await fs.readFileSync(flightInfoPath));
    if (!flightInfo.length)
      return res.status(404).json({ message: `We are sorry no flight found` });

    flightInfo = flightInfo.filter((f) => f.id == flightId);

    if (!flightInfo.length)
      return res
        .status(404)
        .json({ message: `We are sorry no flight found with the id` });

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

    //generating api token to communicate microservices (Payment service and notification service)
    const apiToken = jwt.sign({ user }, apiTokenSecretKey);
    //Make the payment first before confirming the order
    const paymentPayload = {
      bookingType: bookingTypes.FLIGHT,
      paymentData,
      user,
    };
    const bookingId = req.body.bookingId || uuidv1();
    const config = { headers: { token: apiToken } };

    let paymentService;
    try {
      //Service Discovery - get the payment service from Service Registry
      paymentService = await axios.get(
        "http://service-registry:8084/api/find/payment-service/1.0.0"
      );
    } catch (error) {
      logger.info(
        "Payment service not found in service registry please register first with /api/find/payment-service/1.0.0 "
      );
    }

    if (!paymentService || !paymentService.data)
      return res.status(404).json({
        message:
          "Payment service not found in service registry please register first with /api/find/payment-service/1.0.0 ",
      });
    let name = paymentService.data.name;
    let port = paymentService.data.port;
    if (!(name && port))
      return res.status(404).json({
        message:
          "payment service details not found in service registry please register first with /api/find/payment-service/1.0.0",
      });

    const paymentResponse = await axios.post(
      `http://${name}:${port}/api/payment/${bookingId}`,
      paymentPayload,
      config
    );

    const status = paymentResponse
      ? bookingStatus.CONFIRMED
      : bookingStatus.FAIL;
    //storing booking info
    const bookingInfo = {
      id: bookingId,
      user,
      bookingType,
      departure,
      arrival,
      paymentData,
      status,
      createdAt: new Date(),
    };
    // get the flight according to flightid
    const flightBookingInfo = JSON.parse(
      await fs.readFileSync(flightBookingPath)
    );
    flightBookingInfo.push(bookingInfo);
    //sending notification to user
    const type = ["In-App", "Email", "Sms", "Push"];
    const notifyUser = {
      id: user.id,
      email: user.email,
      phone: user.phone,
    };
    const message = paymentResponse
      ? flightNotificationStatus.SUCCESS
      : flightNotificationStatus.FAIL;

    const notificationPayload = {
      message,
      type,
      user: notifyUser,
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
    name = notificationService.data.name;
    port = notificationService.data.port;
    if (!(name && port))
      return res.status(404).json({
        message:
          "Notification service details not found in registry please register first with /registry/api/register/notification-service/1.0.0/8085",
      });
    const notificationURL = `http://${name}:${port}/api/notify`;
    await axios.post(notificationURL, notificationPayload, config);

    logger.info(
      `Your flight booking was confirmed ${JSON.stringify(bookingInfo)}`
    );
    return res.status(201).json({
      message: "Your flight booking was confirmed",
      response: bookingInfo,
    });
  } catch (error) {
    logger.error(`Error while booking flight ${JSON.stringify(error)}`);
    return res
      .status(500)
      .json({ message: `Something went wrong while booking flight`, error });
  }
});

module.exports = router;

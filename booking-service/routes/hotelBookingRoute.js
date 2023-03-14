const express = require("express");
const fs = require("fs");
const path = require("path");
const { v1: uuidv1 } = require("uuid");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const router = express.Router();
const bookingTypes = require("../constant/bookingType");
const hotelNotificationStatus = require("../constant/hotelNotificationStatus");
const bookingStatus = require("../constant/bookingStatus");
const hotelInfoPath = path.join(process.cwd(), "models/hotel.json");
const hotelBookingPath = path.join(process.cwd(), "models/hotelBooking.json");
const requiredAuthToken = require("../middleware/requiredAuthToken");
const apiTokenSecretKey = process.env.API_TOKEN_SECRET_KEY;
const logger = require("../logger");

/**
 * Booking a hotel
 * Middleware:
 *       need an api token to authenticate b/w microservces from postman API_TOKEN_KEY
 *       need a jwt token for authenticating valid user (communication within microservices)
 * Description: We are booking a hotel or hotel for a user
 * API Endpoint Example = /api/hotel/:hotelId
 */
router.post("/:hotelId", requiredAuthToken, async (req, res, next) => {
  try {
    //get hotel details
    const { user, room, paymentData } = req.body;
    const { hotelId } = req.params;
    if (!hotelId)
      return res
        .status(404)
        .json({ message: `Please provide a valid hotel for booking` });

    // get the hotel according to hotelid
    let hotelInfo = JSON.parse(await fs.readFileSync(hotelInfoPath));
    if (!hotelInfo.length)
      return res.status(404).json({ message: `We are sorry no hotel found` });

    hotelInfo = hotelInfo.filter((f) => f.id == hotelId);

    if (!hotelInfo.length)
      return res
        .status(404)
        .json({ message: `We are sorry no hotel found with the id` });

    if (!room)
      return res
        .status(404)
        .json({ message: `Please provide a valid room type for payment` });

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
      bookingType: bookingTypes.HOTEL,
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
      logger.error(
        "Payment service not found in service registry please register first with /api/find/payment-service/1.0.0 "
      );
      logger.error(error);
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
    // storing booking info
    const bookingInfo = {
      id: bookingId,
      user,
      room,
      paymentData,
      status,
      createdAt: new Date(),
    };
    // get the hotel according to hotelid
    const hotelBookingInfo = JSON.parse(
      await fs.readFileSync(hotelBookingPath)
    );
    hotelBookingInfo.push(bookingInfo);
    // storing Payment in database
    // check later
    // fs.writeFile(hotelBookingPath, JSON.stringify(hotelBookingInfo), (err) => {
    //   if (err) throw err;
    //   logger.error(`hotel booking is ${status}`);
    // });
    // sending notification to user
    const type = ["In-App", "Email", "Sms", "Push"];
    const notifyUser = {
      id: user.id,
      email: user.email,
      phone: user.phone,
    };
    const message = paymentResponse
      ? hotelNotificationStatus.SUCCESS
      : hotelNotificationStatus.FAIL;

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
      logger.error(
        "Notification service not found in registry please register first with /registry/api/register/notification-service/1.0.0/8085"
      );
      logger.error(error);
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
      `Your hotel booking was confirmed ${JSON.stringify(bookingInfo)}`
    );
    return res.status(201).json({
      message: "Your hotel booking was confirmed",
      response: bookingInfo,
    });
  } catch (error) {
    logger.error(`Error while booking hotel ${JSON.stringify(error)}`);
    return res
      .status(500)
      .json({ message: `Something went wrong while booking hotel`, error });
  }
});

module.exports = router;

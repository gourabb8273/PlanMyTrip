const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { v1: uuidv1 } = require("uuid");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET_KEY;
const requiredAuth = require("../middleware/requiredAuth");
const logger = require("../logger");
const apiTokenSecretKey = process.env.API_TOKEN_SECRET_KEY;

/**
 * Booking a flight
 * Middleware: need and jwt token for authenticating valid user
 * Description: We are booking a flight for a user
 * API Endpoint Example = /api/booking/flight/S5G5S6DFS63S
 */
router.post("/flight/:flightId", requiredAuth, async (req, res, next) => {
  try {
    const { bookingType, departure, arrival, paymentData } = req.body;
    const { flightId } = req.params;
    const user = {
      username: req.username,
      email: req.email,
      phone: req.phone,
      id: req.id,
    };
    if (!flightId)
      return res
        .status(404)
        .json({ message: `Please provide a valid flight for booking` });
    //generating booking id
    const bookingId = uuidv1();
    //generating api token to communicate microservices (Payment service and notification service)
    const apiToken = jwt.sign({ user }, apiTokenSecretKey);
    const config = { headers: { token: apiToken } };
    const orderPayload = {
      bookingId,
      bookingType,
      departure,
      arrival,
      paymentData,
      user,
    };

    let bookingService;
    try {
      //Service Discovery - get the booking service from Service Registry
      bookingService = await axios.get(
        "http://service-registry:8084/api/find/booking-service/1.0.0"
      );
    } catch (error) {
      logger.error(
        "booking service is not available in registry please register first"
      );
      logger.error(error);
    }
    if (!bookingService) {
      return res.status(404).json({
        message: `booking service is not available in registry please register first with /registry/api/register/booking-service/1.0.0/8083`,
      });
    }

    if (!bookingService.data)
      return res.status(404).json({
        message:
          "Booking service not found in service registry please register with /registry/api/register/booking-service/1.0.0/8083",
      });
    let name = bookingService.data.name;
    let port = bookingService.data.port;
    if (!(name && port))
      return res.status(404).json({
        message:
          "Booking service details not found in service registry please register with /registry/api/register/booking-service/1.0.0/8083",
      });

    const orderResponse = await axios.post(
      `http://${name}:${port}/api/flight/${flightId}`,
      orderPayload,
      config
    );

    res.status(201).json({
      message: "Your flight booking was confirmed",
      response: orderPayload,
    });
  } catch (error) {
    logger.error(`Error while booking flight ${JSON.stringify(error)}`);
    res
      .status(500)
      .json({ message: `Something went wrong while booking flight`, error });
  }
});

/**
 * Booking a hotel
 * Middleware: need and jwt token for authenticating valid user
 * Description: We are booking a hotel for a user
 * API Endpoint Example = /api/booking/hotel/HSDF87F687RG
 */
router.post("/hotel/:hotelId", requiredAuth, async (req, res, next) => {
  try {
    const { room, paymentData } = req.body;
    const { hotelId } = req.params;
    const user = {
      username: req.username,
      email: req.email,
      phone: req.phone,
      id: req.id,
    };
    if (!hotelId)
      return res
        .status(404)
        .json({ message: `Please provide a valid hotel for booking` });
    //generating booking id
    const bookingId = uuidv1();
    //generating api token to communicate microservices (Payment service and notification service)
    const apiToken = jwt.sign({ user }, apiTokenSecretKey);
    const config = { headers: { token: apiToken } };
    const orderPayload = {
      bookingId,
      room,
      paymentData,
      user,
    };
    let bookingService;
    try {
      //Service Discovery - get the booking service from Service Registry
      bookingService = await axios.get(
        "http://service-registry:8084/api/find/booking-service/1.0.0"
      );
    } catch (error) {
      logger.error(
        "booking service is not available in registry please register first"
      );
      logger.error(error);
    }
    if (!bookingService) {
      return res.status(404).json({
        message: `booking service is not available in registry please register first with /registry/api/register/booking-service/1.0.0/8083`,
      });
    }

    if (!bookingService.data)
      return res.status(404).json({
        message:
          "Booking service not found in service registry please register with /registry/api/register/booking-service/1.0.0/8083",
      });
    let name = bookingService.data.name;
    let port = bookingService.data.port;
    if (!(name && port))
      return res.status(404).json({
        message:
          "Booking service details not found in service registry please register with /registry/api/register/booking-service/1.0.0/8083",
      });

    const orderResponse = await axios.post(
      `http://${name}:${port}/api/hotel/${hotelId}`,
      orderPayload,
      config
    );

    logger.info(`Your hotel booking was confirmed ${JSON.stringify(user)}`);
    res.status(201).json({
      message: "Your hotel booking was confirmed",
      response: orderPayload,
    });
  } catch (error) {
    logger.error(`Error while booking hotel ${JSON.stringify(error)}`);
    res
      .status(500)
      .json({ message: `Something went wrong while booking hotel`, error });
  }
});

module.exports = router;

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const flightStatus = require("../constant/flightStatus");
const flightInfoPath = path.join(process.cwd(), "models/flight.json");
const logger = require("../logger");

/**
 * Showing all available flight
 * Description: We are not passing any middleware as any one can see available flights
 * API Endpoint Example = /api/flight
 */
router.get("/", async (req, res, next) => {
  try {
    const flightData = JSON.parse(await fs.readFileSync(flightInfoPath));
    //filtering all flight those are yet to scheduled
    const data = flightData.filter((f) => f.status == flightStatus.WAITING);
    logger.info(`Available Flights are fetched successfully`);
    res.status(201).json({
      message: `Available Flights are fetchched successfully`,
      count: data.length,
      data: data,
    });
  } catch (error) {
    logger.error(
      `Error while showing a list of available flight ${JSON.stringify(error)}`
    );
    res
      .status(500)
      .json({ message: `Something went wrong while showing a list of flight` });
  }
});

/**
 * Showing available flight based on location filter
 * Description: We are not passing any middleware as any one can see available flights
 * API Endpoint Example = /api/flight/kolkata/delhi
 */
router.get("/:departure/:arrival", async (req, res, next) => {
  try {
    const flightData = JSON.parse(await fs.readFileSync(flightInfoPath));
    const { departure, arrival } = req.params;
    if (!departure)
      res
        .status(400)
        .json({ message: `Please provide a valid departure location` });

    if (!arrival)
      res
        .status(400)
        .json({ message: `Please provide a valid arrival location` });

    //filtering flight based on availablity and location
    const data = flightData.filter(
      ({ status, schedule }) =>
        status == flightStatus.WAITING &&
        schedule &&
        schedule.departure &&
        schedule.departure.location.toLowerCase() === departure.toLowerCase() &&
        schedule.arrival &&
        schedule.arrival.location.toLowerCase() == arrival.toLowerCase()
    );
    if (!data.length)
      return res.status(201).json({
        message: `We are sorry no flights are available at this moment`,
        count: data.length,
        data: data,
      });
    logger.info(
      `Available Flights are fetched successfully ${JSON.stringify(req.params)}`
    );
    res.status(200).json({
      message: `Available Flights are fetched successfully`,
      count: data.length,
      data: data,
    });
  } catch (error) {
    logger.error(
      `Error while showing a list of availble flight ,${JSON.stringify(error)}`
    );
    res.status(500).json({
      message: `Something went wrong while showing a list of flight`,
      error,
    });
  }
});

/**
 * Showing available flight based on location filter and day
 * Description: We are not passing any middleware as any one can see available flights
 * API Endpoint Example = /api/flight/kolkata/delhi/2
 */
router.get("/:departure/:arrival/:dayNum", async (req, res, next) => {
  try {
    const flightData = JSON.parse(await fs.readFileSync(flightInfoPath));
    const { departure, arrival, dayNum } = req.params;
    if (!departure)
      res
        .status(400)
        .json({ message: `Please provide a valid departure location` });

    if (!arrival)
      res
        .status(400)
        .json({ message: `Please provide a valid arrival location` });

    if (!dayNum)
      res
        .status(400)
        .json({ message: ` Please provide a valid departure day` });

    //filtering flight based on availablity
    const data = flightData.filter(
      ({ status, schedule }) =>
        status == flightStatus.WAITING &&
        schedule &&
        schedule.departure &&
        schedule.departure.location.toLowerCase() === departure.toLowerCase() &&
        schedule.arrival &&
        schedule.arrival.location.toLowerCase() == arrival.toLowerCase() &&
        schedule.dayOfWeek.includes(parseInt(dayNum))
    );
    if (!data.length)
      return res.status(201).json({
        message: `We are sorry no flights are available at this moment`,
        count: data.length,
        data: data,
      });
    logger.info(
      `Available Flights are fetched successfully ${JSON.stringify(req.params)}`
    );
    res.status(200).json({
      message: `Available Flights are fetched successfully`,
      count: data.length,
      data: data,
    });
  } catch (error) {
    logger.error(
      `Error while showing a list of availble flight ,${JSON.stringify(error)}`
    );
    res.status(500).json({
      message: `Something went wrong while showing a list of flight`,
      error,
    });
  }
});

module.exports = router;

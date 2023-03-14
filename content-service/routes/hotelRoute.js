const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const hotelInfoPath = path.join(process.cwd(), "models/hotel.json");
const logger = require("../logger");

/**
 * Showing all available hotel
 * Description: we are not passing any middleware as any one can see available hotel
 * API Endpoint Example = /api/hotel
 */
router.get("/", async (req, res, next) => {
  try {
    const hotelData = JSON.parse(await fs.readFileSync(hotelInfoPath));
    //filtering all hotel those are yet to be booked
    const data = hotelData.filter((h) => h.availableRoom !== 0);
    logger.info(`Available hotels are fetched successfully`);
    res.status(200).json({
      message: `Available hotels are fetchched successfully`,
      data: data,
      count: data.length,
    });
  } catch (error) {
    logger.error(
      `Error while showing a list of available hotel ${JSON.stringify(error)}`
    );
    res
      .status(500)
      .json({ message: `Something went wrong while showing a list of hotel` });
  }
});

/**
 * Showing available hotel based on location filter
 * Description: We are not passing any middleware as any one can see available hotel
 * API Endpoint Example = /api/hotel/kolkata
 */
router.get("/:location", async (req, res, next) => {
  try {
    const hotelData = JSON.parse(await fs.readFileSync(hotelInfoPath));
    const { location } = req.params;
    if (!location)
      return res
        .status(400)
        .json({ message: `Please provide a valid location` });

    //filtering hotel based on availablity and location
    const data = hotelData.filter(
      ({ address, availableRoom }) =>
        availableRoom !== 0 &&
        address.location.toLowerCase() == location.toLowerCase()
    );
    if (!data.length)
      return res.status(201).json({
        message: `We are sorry no hotels are available at this moment`,
        data: data,
        count: data.length,
      });
    logger.info(
      `Available hotels are fetched successfully ${JSON.stringify(req.params)}`
    );
    res.status(200).json({
      message: `Available hotels are fetched successfully`,
      data: data,
      count: data.length,
    });
  } catch (error) {
    logger.error(
      `Error while showing a list of availble hotel ,${JSON.stringify(error)}`
    );
    res.status(500).json({
      message: `Something went wrong while showing a list of hotel`,
      error,
    });
  }
});

/**
 * Showing available hotel based on location filter and no of room and tyoe
 * Description: we are not passing any middleware as any one can see available hotel
 * API Endpoint Example = /api/hotel/kolkata/2/double/true
 */
router.get("/:location/:numOfRoom/:bedType/:hasAc", async (req, res, next) => {
  try {
    const hotelData = JSON.parse(await fs.readFileSync(hotelInfoPath));
    const { location, numOfRoom, bedType, hasAc } = req.params;
    if (!location)
      return res
        .status(400)
        .json({ message: `Please provide a valid location` });

    if (!numOfRoom)
      return res
        .status(400)
        .json({ message: `Please provide a no of room required` });

    if (!bedType)
      return res
        .status(400)
        .json({ message: ` Please provide type of bed required` });

    if (!hasAc)
      return res
        .status(201)
        .json({ message: ` Please provide whether you need ac or not` });
    const hasACBool = hasAc === "true" || hasAc === true;
    let data = hotelData.map((d) => {
      d.room =
        d.room &&
        d.room.filter(
          (r) => r.hasAc == !!hasACBool && r.bedType.toLowerCase() == bedType
        );
      d.availableRoom = d.room.length;
      return d;
    });
    data = data.filter(
      ({ address, availableRoom }) =>
        address.location &&
        address.location.toLowerCase() == location.toLowerCase() &&
        availableRoom >= parseInt(numOfRoom)
    );
    if (!data.length)
      return res.status(201).json({
        message: `We are sorry no hotels are available at this moment`,
        data: data,
        count: data.length,
      });
    logger.info(
      `Available hotels are fetched successfully ${JSON.stringify(req.params)}`
    );
    res.status(200).json({
      message: `Available hotels are fetched successfully`,
      data: data,
      count: data.length,
    });
  } catch (error) {
    logger.error(
      `Error while showing a list of availble hotel ,${JSON.stringify(error)}`
    );
    res.status(500).json({
      message: `Something went wrong while showing a list of hotel`,
      error,
    });
  }
});

module.exports = router;

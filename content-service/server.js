const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const flightRoute = require("./routes/flightRoute");
const hotelRoute = require("./routes/hotelRoute");
const logger = require("./logger");

const config = require("./config")["development"];
// const log = config.log();
// const service = require("./server/service")(config);

const { swaggerServe, swaggerSetup } = require("./swagger/config");

const app = express();
const port = process.env.SERVICE_PORT || 8081;

app.use(cors());
// support parsing of application/json type post data
app.use(bodyParser.json());
app.use("/api-docs", swaggerServe, swaggerSetup);
app.use("/api/flight", flightRoute);
app.use("/api/hotel", hotelRoute);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Content service is called" });
});

//Error Handler
app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ message: err.message });
});

app.listen(port, () => {
  logger.info(`Content service is listening at http:localhost:${port}`);
});

app.on("listening", () => {
  // service registration
  const registerService = () =>
    axios.put(
      `http://service-registry:8084/register/${config.name}/${config.version}/${port}`
    );

  // service unregistration
  const unregisterService = () =>
    axios.put(
      `http://service-registry:8084/register/${config.name}/${config.version}/${port}`
    );

  registerService();

  // re register service every 30 sec
  const interval = setInterval(registerService, 30000);

  const cleanup = async () => {
    clearInterval();
    await unregisterService();
  };
  //when ctrl + c is pressed and service is down
  process.on("SIGINT", async () => {
    await cleanup(interval);
    process.exit(0);
  });

  //when process is killed and service is down
  process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(0);
  });

  //if any error comes and service is down
  process.on("uncaughtException", async () => {
    await cleanup();
    process.exit(0);
  });

  logger.info("Content service is registered successfuly");
});

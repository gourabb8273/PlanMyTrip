const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const logger = require("./logger");

const serviceRegistrationRoute = require("./routes/serviceRegistrationRoute");

const config = require("./config")["development"];

// const log = config.log();
// const service = require("./server/service")(config);

const { swaggerServe, swaggerSetup } = require("./swagger/config");

const app = express();
const port = process.env.SERVICE_PORT || 8081;

//cors handling
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
// support parsing of application/json type post data
app.use(bodyParser.json());
app.use("/api-docs", swaggerServe, swaggerSetup);
app.use("/api", serviceRegistrationRoute);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "service registy service is called" });
});

//Error Handler
app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ message: err.message });
});

app.listen(port, () => {
  logger.info(
    `Service Registry service is listening at http://localhost:${port}`
  );
});

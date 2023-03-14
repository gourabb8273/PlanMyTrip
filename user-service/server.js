const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const loginRoute = require("./routes/loginRoute");
const signupRoute = require("./routes/signupRoute");
const userListRoute = require("./routes/userListRoute");
const bookingRoute = require("./routes/bookingRoute");
const config = require("./config")["development"];
const log = config.log();
const service = require("./server/service")(config);
const logger = require("./logger");

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
// support parsing of application/json type post dat
app.use(bodyParser.json());
app.use("/api-docs", swaggerServe, swaggerSetup);

app.get("/", (req, res) => {
  res.status(200).json({ message: "user service is called" });
});

app.use("/api/signup", signupRoute);
app.use("/api/login", loginRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/users", userListRoute); //only for admin

app.get("/", (req, res) => {
  res.status(200).json({ message: "User service is called" });
});

//Error Handler
app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ message: err.message });
});

app.listen(port, () => {
  logger.info(`User service is listening at http://localhost:${port}`);
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

  logger.info("User service is registered successfuly");
});

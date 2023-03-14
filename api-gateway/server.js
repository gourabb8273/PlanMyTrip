const express = require("express");
const gateway = require("fast-gateway");
require("dotenv").config();

const serverConfig = require("./config/gatewayConfig");
const logger = require("./logger")

const app = express();



const port = process.env.SERVICE_PORT || 9001;

const authCheck = (req, res, next) => {
  if (req.headers && req.headers.token && req.headers.token != "") {
    next();
  } else {
    res.setHeader("Content-type", "application/json");
    res.statusCode = 401;
    res.end(JSON.stringify({ status: 401, message: "Authentication fail" }));
  }  
};
const server = gateway(serverConfig);

server.get("/", (req, res) => {
  res.send("API Gateway is called");
});

server.start(port).then((server) => {
  logger.info(`API Gateway is running at port ${port}`);
});

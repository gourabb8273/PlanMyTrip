const rateLimit = require("express-rate-limit");
const requestIp = require("request-ip");
// cache middleware
const cache = require("http-cache-middleware")();

const requiredAuth = require("../middleware/requiredAuth");
const rateLimitConfig = require("../middleware/rateLimit");
const serviceURL = require("../constant/serviceURL");

const serverConfig = {
  // setting global timeout
  timeout: 10000,
  middlewares: [
    require("cors")(),
    require("helmet")(),
    // first acquire request IP
    (req, res, next) => {
      req.ip = requestIp.getClientIp(req);
      return next();
    },
    // second enable rate limiter
    rateLimit(rateLimitConfig),
    cache, //caching to enhance the respose time
  ],
  routes: [
    {
      proxyType: "http",
      prefix: "/registry",
      target: serviceURL.SERVICE_REGISTRY,
      hooks: {},
      methods: ["GET", "DELETE", "PUT"],
    },
    {
      proxyType: "http",
      prefix: "/user",
      target: serviceURL.USER_SERVICE,
      hooks: {},
      methods: ["GET", "POST"],
    },
    {
      proxyType: "http",
      prefix: "/search",
      target: serviceURL.CONTENT_SERVICE,
      hooks: {},
      methods: ["GET", "POST"],
    },
    {
      proxyType: "http",
      prefix: "/booking",
      target: serviceURL.BOOKING_SERVICE,
      hooks: {},
      methods: ["GET", "POST"],
    },
    {
      proxyType: "http",
      prefix: "/notification",
      target: serviceURL.NOTIFICATION_SERVICE,
      hooks: {},
      methods: ["GET", "POST"],
    },
    {
      proxyType: "http",
      prefix: "/pay",
      target: serviceURL.PAYMENT_SERVICE,
      hooks: {},
      methods: ["GET", "POST"],
    },
  ],
};

module.exports = serverConfig;

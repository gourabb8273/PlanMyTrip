
//configure rate limiting
const rateLimitConfig = {
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 60, // limit each IP to 60 requests per windowMs
  message: "my initial message",
  handler: (req, res) =>
    res.send("Too many requests, please try again later",429),
};

module.exports = rateLimitConfig;
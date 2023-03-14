const flightStatus = Object.freeze({
  RUNNING: "running",
  WAITING: "waiting to be scheduled",
  CANCELLED: "cancelled"
});

module.exports = flightStatus;

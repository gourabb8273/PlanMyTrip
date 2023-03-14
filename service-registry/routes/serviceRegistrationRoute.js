const express = require("express");
const ServiceRegistry = require("../lib/ServiceRegistry");
const fs = require("fs");
const path = require("path");
const { v1: uuidv1 } = require("uuid");

const logger = require("../logger");

const serviceRegistryPath = path.join(
  process.cwd(),
  "models/serviceRegistry.json"
);
const router = express.Router();

/**
 * Registering a microservice when service is up and running
 * Description: We are adding a service with version and port in service registery for future discovery
 * API Endpoint Example = /api/register/user-service/1.0.0/8081 PUT
 */

router.put(
  "/register/:servicename/:serviceversion/:serviceport",
  async (req, res) => {
    const { servicename, serviceversion, serviceport } = req.params;

    if (!servicename)
      return res.status(400).json("Please provide a service name");

    if (!serviceversion)
      return res.status(400).json("Please provide a service version");

    if (!serviceport)
      return res.status(400).json("Please provide a service port");

    const serviceip = req.connection.remoteAddress.includes("::")
      ? `[${req.connection.remoteAddress}]`
      : req.connection.remoteAddress;
    const serviceRegistry = new ServiceRegistry();
    const serviceKey = serviceRegistry.register(
      servicename,
      serviceversion,
      serviceip,
      serviceport
    );
    logger.info(serviceRegistryPath);
    let service = { service: serviceKey, updatedAt: new Date(), id: uuidv1() };
    const serviceRegistryInfo = JSON.parse(
      await fs.readFileSync(serviceRegistryPath)
    );
    logger.info(serviceRegistryInfo);
    const existingServiceKey =
      serviceRegistryInfo.length &&
      serviceRegistryInfo.find((service) => service.service === serviceKey);
    if (existingServiceKey) existingServiceKey.updatedAt = new Date();
    else {
      serviceRegistryInfo.push(service);
    }
    fs.writeFile(
      serviceRegistryPath,
      JSON.stringify(serviceRegistryInfo),
      (err) => {
        if (err) throw err;
        logger.info("Service is registered successfully");
      }
    );
    return res.json({
      message: "Service is registered successfully",
      result: service,
    });
  }
);

/**
 * De-registering a microservice when service is down
 * Description: We are deleting a service with version and port from service registery when it's down
 * API Endpoint Example = /api/register/user-service/1.0.0/8081 DELETE
 */

router.delete(
  "/deregister/:servicename/:serviceversion/:serviceport",
  async (req, res) => {
    const { servicename, serviceversion, serviceport } = req.params;

    if (!servicename)
      return res.status(400).json("Please provide a service name");

    if (!serviceversion)
      return res.status(400).json("Please provide a service version");

    if (!serviceport)
      return res.status(400).json("Please provide a service port");

    const serviceip = req.connection.remoteAddress.includes("::")
      ? `[${req.connection.remoteAddress}]`
      : req.connection.remoteAddress;
    logger.info(
      JSON.stringify({ servicename, serviceversion, serviceport, serviceip })
    );
    const serviceRegistry = new ServiceRegistry();
    const serviceKey = await serviceRegistry.unregister(
      servicename,
      serviceversion,
      serviceip,
      serviceport
    );
    return res.json(serviceKey);
  }
);

/**
 * Service Discovery
 * Description: we are checking service registry for service discovery
 * API Endpoint Example = /api/find/user-service/1.0.0 GET
 */
router.get("/find/:servicename/:serviceversion", async (req, res) => {
  const { servicename, serviceversion } = req.params;
  if (!servicename)
    return res.status(400).json("Please provide a service name");

  if (!serviceversion)
    return res.status(400).json("Please provide a service version");

  const serviceRegistry = new ServiceRegistry();
  const svc = await serviceRegistry.get(servicename, serviceversion);
  if (!svc) return res.status(404).json({ result: "Service not found" });
  return res.json(svc);
});

module.exports = router;

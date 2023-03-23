const semver = require("semver");
// const ServiceRegistryData = require("./lib/ServiceRegistry");
const fs = require("fs");
const path = require("path");
const logger = require("../logger");
const serviceRegistryPath = path.join(
  process.cwd(),
  "models/serviceRegistry.json"
);

class ServiceRegistry {
  constructor(log) {
    this.services = {};
    this.timeout = 10;
  }

  async get(name, version) {    
    const serviceRegistryInfo = JSON.parse(
      await fs.readFileSync(serviceRegistryPath)
    );

    if (!serviceRegistryInfo.length) {
      logger.info("Service registry is empty");
      return null;
    }
    const serviceInfo = serviceRegistryInfo.find(
      (s) => s.service && s.service.split("[").includes(name.concat(version))
    );    
    if (!serviceInfo || !serviceInfo.service) {
      logger.info("Service not found");
      return null;
    }
    serviceInfo.name =name;
    serviceInfo.version =version;
    serviceInfo.port = serviceInfo.service.split("]")[1];
    return serviceInfo;
  }

  register(name, version, ip, port) {
    const key = name + version + ip + port;

    if (!this.services[key]) {
      this.services[key] = {};
      this.services[key].timestamp = Math.floor(new Date() / 1000);
      this.services[key].ip = ip;
      this.services[key].port = port;
      this.services[key].name = name;
      this.services[key].version = version;
      logger.info(this.service);
      logger.info(
        `Added services ${name}, version ${version} at ${ip}:${port}`
      );
      return key;
    }
    logger.info(
      `Updated services ${name}, version ${version} at ${ip}:${port}`
    );
    logger.info(`path`);

    return key;
  }

  async unregister(name, version, ip, port) {
    const key = name + version + ip + port;
    const serviceRegistryInfo = JSON.parse(
      await fs.readFileSync(serviceRegistryPath)
    );
    if (!serviceRegistryInfo.length) {
      logger.info("Service registry is empty");
      return null;
    }
    //check whether service is there or not
    let serviceInfo = serviceRegistryInfo.find(
      (s) => s.service && s.service.split("[").includes(name.concat(version))
    );

    logger.info(serviceInfo)

    if (!(serviceInfo && serviceInfo.service)) {
      logger.info("Service is not found already de registered");
      return { message: `${name} is not found already de registered` };
    }

    serviceInfo = serviceRegistryInfo.filter(
      (s) =>
        s.service &&
        (!s.service.split("[").includes(name.concat(version)) ||
        !s.service.split("]").includes(port))
    );

    logger.info(JSON.stringify(serviceInfo))

    fs.writeFile(
      serviceRegistryPath,
      JSON.stringify(serviceInfo),
      (err) => {
        if (err) throw err;
        logger.info("Service is deleted successfully");
      }
    );
    return { message: `${name} is de-registered successfully`, result: key };
  }
}

module.exports = ServiceRegistry;

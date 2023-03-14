const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");

const swaggerJSDoc = YAML.load("./api.yaml");

module.exports = {
  swaggerServe: swaggerUi.serve,
  swaggerSetup: swaggerUi.setup(swaggerJSDoc),
};

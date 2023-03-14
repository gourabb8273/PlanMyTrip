require("dotenv").config();

const contentServicePort = process.env.CONTENT_SERVICE_PORT;
const userServicePort = process.env.USER_SERVICE_PORT;
const bookingServicePort = process.env.BOOKING_SERVICE_PORT;
const paymentServicePort = process.env.PAYMENT_SERVICE_PORT;
const notificationServicePort = process.env.NOTIFICATION_SERVICE_PORT;
const serviceRegistryePort = process.env.SERVICE_REGISTRY_PORT;

const networkProtocol = "http";

const serviceURL = {
  CONTENT_SERVICE: `${networkProtocol}://content-service:${contentServicePort}`,
  USER_SERVICE: `${networkProtocol}://user-service:${userServicePort}`,
  BOOKING_SERVICE: `${networkProtocol}://booking-service:${bookingServicePort}`,
  PAYMENT_SERVICE: `${networkProtocol}://payment-service:${paymentServicePort}`,
  NOTIFICATION_SERVICE: `${networkProtocol}://notification-service:${notificationServicePort}`,
  SERVICE_REGISTRY: `${networkProtocol}://service-registry:${serviceRegistryePort}`,
};

module.exports = serviceURL;
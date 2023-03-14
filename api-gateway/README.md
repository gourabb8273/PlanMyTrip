# Application: PlanMyTrip
# Microservice Name : API Gateway
# Description:
    API Gateway acts as a "front door" for applications to access data, business logic, or functionality from your backend services,

## This is the front door of all the below microservices,

### user service: 
  User can sign up and login also can book a flight and hotel
### content service:
  User can search flight and hotel from read database
### booking service:
  This service is responsible for booking a flight and hotel
### payment service: 
  This service is responsible for payment while booking a flight and hotel
### notification service: 
  This service is responsible for notifying user when an action performed like booking, payment, signup etc
### service registry: 
  This service is responsible for registering and de-registering the service for service discovery

## Gateway Configuration
  source: /config/gateWayConfig (here we are adding the entry point for all microservices also adding middleware)

## Constant
   we are using constant for static type field for better management like search category hotel or flight etc
   ### Service URL
      source: /constant/serviceURL.js
      description: Storing URLs of all microservices with dynamic port (taking from env)

## Middlewares
  ### Ratelimit:
    We are limiting multiple api calls in a given time to avoid D-Dos attack
    source: /middleware/rateLimit (currenlty having limit of 60 requests with in 1 mintue we can change the limit and time)

  ### Caching:
    using caching to improve the response time

  ### Request time out:
    Setting global timeout of 10 sec

## Entry Point
    source: /server.js

## Swagger Docs API: 
    /api-docs


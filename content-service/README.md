# Application: PlanMyTrip

# Microservice Name : content service
# Description:
   User can search flight and hotel from read database (CQRS patterns for read write isolation) like elastic search engine for better performance 

## Database
   we are using json file based database        
   ### flight collection
      source: /models/flight.json
      description: Fetching all available flight information like capacity location etc.
   ### hotel collection
      source: /models/hotel.json
      description: Fetching all available hotel information like no of rooms, room type, location etc.

## Constant
   we are using constant for static type field for better management like search category hotel or flight etc
   ### Category
      source: /constant/category.js
      description: Storing search category like hotel or flight, we can add on other category like train bus in future

### logger:
    Using winston libraries for logging 
    source: logger.js

## APIs
  ### flightRoute:
    source: routes/flightRoute.js
    description: Fetching flight info from read database
    validation: No auth required anyone can search availability while booking auth is required
    endpoint: api/flight GET

  ### hotelRoute:
    source: routes/hotelRoute.js
    description: Fetching hotel info from read database
     validation: No auth required anyone can search availability while booking auth is required
    endpoint: api/hotel GET

## Entry Point
    source: /server.js

## Swagger Docs API: 
    /api-docs

## env variable
  ### SERVICE_PORT 
     Port where this microservice is running
  ### JWT_SECRET_KEY
     Secret key for creating jwt token for user authentication and authorization
  ### API_TOKEN_SECRET_KEY
     This is a static key required to add in req header as key token for calling api of indivicual microservices using postman or swagger 
  ### API_TOKEN_KEY
     Secret key is required to verify jwt token while having communication with in microservices
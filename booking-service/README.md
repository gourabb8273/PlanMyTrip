# Application: PlanMyTrip

# Microservice Name : Booking service
# Description:
   Managing all booking of flight and hotel

## Database
   we are using json file based database        
   ### payment collection
      source: /models/flight.json
      description: storing all available flight
   ### hotel collection
      source: /models/hotel.json
      description: storing all available hotel
   ### flight booking collection
      source: /models/flightBooking.json
      description: storing all booking information of flight
   ### hotel booking collection
      source: /models/hotelBooking.json
      description: storing all booking information of hotel

## Constant
   we are using constant for static type field for better management like booking status, type etc
   ### Booking status      
      source: /constant/bookingStatus.js
      description: Payment status like confirmed or fail

   ### Booking type
      source: /constant/bookingType.js
      description: Notification type like hotel or flight

   ### Flight notification status
      source: /constant/flightNotificationStatus.js
      description: Notification status that needs to be sent after booking flight

   ### Hotel Notification status
      source: /constant/hotelNotificationStatus.js
      description: Notification status that needs to be sent after booking hotel

## Middlewares
  ### requiredAuthToken:
    This will check and validate api token's signature using api secret key (API_TOKEN_SECRET_KEY) or if calling from postman or swagger need to pass API_TOKEN_KEY in req header as token key
    source: /middleware/requiredAuthToken

### logger:
    Using winston libraries for logging 
    source: logger.js	
	
## APIs
  ### Flight booking route:
    source: routes/flightBookingRoute.js
    description: Booking a flight after making payment and sending notification
    validation: Verifying api token's signature with api secrect key and valid flight, payment and user info
    endpoint: /api/flight/{flightId} POST  (Get the valid flight id from flight collection of content service e.g S5G5S6DFS63S is a valid flightId)

  ### Flight booking route:
    source: routes/hotelBookingRoute.js
    description: Booking a hotel after making payment and sending notification
    validation: Verifying api token's signature with api secrect key and valid hotel, payment and user info
    endpoint: /api/hotel/{hotelId} POST  (Get the valid hotel id from hotel collection of content service e.g HSDF87F687RG is a valid hotelId)

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
# Application: PlanMyTrip

# Microservice Name : Payment service
# Description:
   Managing all payment while booking flight and hotel

## Database
   we are using json file based database        
   ### payment collection
      source: /models/payment.json
      description: Stroing all payment invoice 

## Constant
   we are using constant for static type field for better management like role, status etc
   ### files
      source: /constant/paymentStatus.js
      description: payment status like success or fail

      source: /constant/notificationType.js
      description: notification type like sms, email, in-app or push

## Middlewares
  ### requiredAuthToken:
    This will check and validate api token's signature using api secret key (API_TOKEN_SECRET_KEY) or if calling from postman or swagger need to pass API_TOKEN_KEY in req header as token key
    source: /middleware/requiredAuthToken

## Logging  
    Using winston libraries for logging 
    source: logger.js

## APIs
  ### payment route:
    source: routes/paymentRoute.js
    description: storing payment invoice in payment.json collection
    validation: Verifying booking id, booking type, user info and api token's signature with api secrect key
    endpoint: api/payment/{bookingId} POST 

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
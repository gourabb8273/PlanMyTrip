# Application: PlanMyTrip

# Microservice Name : Notification service
# Description:
   Sending notification to user when some actions are performed like registering, booking, payment

## Database
   we are using json file based database        
   ### notification collection
      source: /models/notification.json
      description: Stroing all notification

## Constant
   we are using constant for static type field for better management like role, status etc
   ### Notification Type
      source: /constants/notificationType.js
      description: Notification type like sms, email, in-app or push

## Middlewares
  ### requiredAuthToken:
    This will check and validate api token's signature using api secret key (API_TOKEN_SECRET_KEY) or if calling from postman or swagger need to pass API_TOKEN_KEY in req header as token key
    source: /middleware/requiredAuthToken.js

  ### logger:
    Using winston libraries for logging 
    source: logger.js

## APIs
  ### notification route:
    source: routes/notificationRoute.js
    description: Sending notification to user
    validation: Verifying if api token's signature with api secrect key
    endpoint: api/notify POST

## Service Registry
    We are registering the service when is up and re-registering the service every 30 sec

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
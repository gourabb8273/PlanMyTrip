# Application: PlanMyTrip

# Microservice Name : User service
# Description:
   User can sign up and login also can book a flight and hotel

## Database
   we are using json file based database        
   ### user collection
      source: /models/user.json
      description: Stroing all the user information after registeration is done

## Constant
   we are using constant for static type field for better management like role, status etc
   ### User role
      source: /constant/userRole.js
      description: Storing user role like admin or user for further authorization

## Middlewares
  ### requiredAdmin:
    This will check whether user role is admin or not also add user info in req header
    source: /middleware/requiredAdmin.js

  ### requiredAuth:
    This will check whether user is authenticated and valid user or not
    source: /middleware/requiredAuth.js

  ### requiredUser:
    This will check whether user role is admin or not also add user info in req header
    source: /middleware/requiredUser.js

## Logging  
    Using winston libraries for logging 
    source: logger.js

## APIs
  ### signup route:
    source: routes/signUpRoutes.js
    description: We are registering a user, storing the info in user.json, sending a notification (calling notification service)  and sharing a jwt token for further communication (storing hashed form of password)
    validation: validating email and phone 
    endpoint: api/signup POST

  ### login route:
    source: routes/loginRoute.js
    description: We are loging a user based on email and password and sharing a jwt token for further communication
    validation: validating if user exists or not 
    endpoint: api/login POST

  ### booking route:
    source: routes/bookingRoutes.js
    description: User can book a flight or hotel this will call booking microservice for confirming booking
    validation: validating if token is valid or not, flight or hotel id should be there
    endpoint:
       api/booking/flight/{flightId} POST (e.g a valid flightId is S5G5S6DFS63S get from content service flight.json database)
       api/booking/hotel/{hotelId} POST (e.g a valid flightId is HSDF87F687RG get from content service hotel.json  database)

  ### listing registered user route:
    source: routes/userListRoute.js
    description: An admin user can see all the registered user from the db
    validation: validating if user is admin or not based on token provided
    endpoint: api/users GET

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
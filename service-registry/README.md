# Application: PlanMyTrip

# Microservice Name : Service registry
# Description:
   A registry where service will be registered when it's up and de-registered when it's done, other microservices will use it for service discovery

## Database
   we are using json file based database        
   ### service registry collection
      source: /models/serviceRegistry.json
      description: Stroing service info like version, name, port

## Middlewares
  ### requiredAuthToken:
    This will check and validate api token's signature using api secret key (API_TOKEN_SECRET_KEY) or if calling from postman or swagger need to pass API_TOKEN_KEY in req header as token key
    source: /middleware/requiredAuthToken.js

### logger:
    Using winston libraries for logging 
    source: logger.js

## APIs
  ### service registrstion route:
    source: routes/serviceRegistrationRoute.js
    description: Registering, de-registering and fetching service    
    endpoint: api/register/{servicename}/{serviceversion}/{serviceport} PUT (Registering a service)
    endpoint: api/register/{servicename}/{serviceversion}/{serviceport} DELETE (De-registering a service)
    endpoint: api/deregister/{servicename}/{serviceversion}/ GET (Fetching a service)

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
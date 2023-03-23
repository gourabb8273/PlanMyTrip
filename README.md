# Application: PlanMyTrip
# Description:
  Welcome to PlanMyTrip (PMT), It’s an online travel portal that used to bridge the gap between service providers (Suppliers – Ex-indigo, Lemon Tree … etc) and service receivers (Consumers - Users). 
  We will show all the available hotels and flights to the user and based on that he or she can book a flight or hotel. 
  This is a backend system of PMT which has used microservice architectural styles.

# Microservice Name :
  ## User Service:
   Responsible for user activity like signup, login, booking a flight and hotel.
  ## Content Service: 
  It’s used as read database like de normalised database or search engine to show all the available flight and hotel. It’s using CQRS pattern for read and write isolation.
  ## Booking Service:
   Taking care of hotel and flight booking.
  ## Payment Service: 
  Taking care of payment for a booking.
  ## Notification Service: 
  Consumer will also get a notification with respect to the booking confirmation and others action.
  ## service registry: 
  This service is responsible for registering and de-registering the service for service discovery
  ## API Gateway : 
  This service acts as a front door for applications to access data, business logic, or functionality from your backend services,

## Please find the README.md file in each microservices for more details

## Swagger Docs API: 
    /api-docs


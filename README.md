# TrAuck Backend API

Welcome to the **TrAuck** Backend API repository! TrAuck is a modern, enterprise-grade logistics and fleet management platform. This project serves as the core backend, providing robust RESTful APIs and real-time communication capabilities for tracking journeys, managing cargo, and overseeing fleets.

## 🏗️ Architecture

This project is built using **.NET (C#)** and adheres strictly to **Clean Architecture** and **Domain-Driven Design (DDD)** principles to ensure scalability, maintainability, and testability.

The solution is divided into the following layers:

- **`TrAuck.Domain`**: The core business logic layer containing Aggregates (`FleetAggregate`, `LoadAggregate`, `TripAggregate`), Entities, Value Objects, Domain Events, and Exceptions.
- **`TrAuck.Application`**: The use-case layer implementing the CQRS (Command Query Responsibility Segregation) pattern. It is organized by features (e.g., Drivers, Trips, Vehicles).
- **`TrAuck.Infrastructure`**: The implementation details layer, handling database persistence, authentication, and external services.
- **`TrAuck.Api`**: The presentation layer (ASP.NET Core Web API) exposing REST endpoints and configuring SignalR hubs for real-time features.
- **`TrAuck.Tests`**: Contains automated tests ensuring the reliability of the system.

## ✨ Core Features

- **🚛 Fleet Management:** Comprehensive tracking and management of `Vehicles` and `Drivers`.
- **🗺️ Trip Tracking:** Scheduling and monitoring of `Trips` from origin to destination.
- **📦 Load Planning:** Organization and management of cargo through `LoadPlans`.
- **⚠️ Incident Management:** Real-time reporting and tracking of `Incidents` (delays, accidents, etc.) during transit.

## 🔌 Real-Time Capabilities

TrAuck utilizes **SignalR** to push real-time updates to client applications (web/mobile).
- `/hubs/trips`: Streams real-time telemetry/GPS data for active trips.
- `/hubs/notifications`: Broadcasts system alerts, incident reports, and important status updates.

## 💾 Polyglot Persistence

The application employs a polyglot persistence strategy to handle different types of data optimally:
- **Relational Database:** Managed via Entity Framework Core (`AppDbContext`), used for structured, transactional data (e.g., user accounts, fleet profiles).
- **NoSQL Database:** Managed via MongoDB (`MongoDbContext`), used for high-throughput, schema-less data (e.g., real-time GPS telemetry logs, complex JSON payloads).

## 🚀 Getting Started

### Prerequisites
- [.NET SDK](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/) (for running infrastructure dependencies)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pfa_trauck
   ```

2. **Run Infrastructure**
   The project includes a `docker-compose.yml` file to quickly spin up the required databases (e.g., SQL DB, MongoDB).
   ```bash
   docker-compose up -d
   ```

3. **Restore & Build**
   ```bash
   dotnet restore TrAuck.Backend.sln
   dotnet build TrAuck.Backend.sln
   ```

4. **Run the API**
   Navigate to the API project and run the application:
   ```bash
   cd TrAuck.Api
   dotnet run
   ```

5. **API Documentation**
   When running in development mode, the API provides OpenAPI documentation. After starting the server, you can view the endpoints (typically at `/swagger` or `/openapi`).

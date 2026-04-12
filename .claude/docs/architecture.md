# Architecture

The project migrates a monolithic .NET Framework application (~40,000 users, ~600-table database) to 5 bounded-context microservices on .NET 8 / Azure.

## Microservices

1. **Travel Booking Service** — Saga orchestrator for booking workflows
2. **Event Management Service** — Events, scheduling, attendees
3. **Payment Service** — Legacy wrapper (Anti-Corruption Layer) in Phase 1
4. **Reporting Service** — Read model, analytics, dashboards
5. **Notification Service** — Email, SMS, push notifications

Each service follows **Clean Architecture**: `API` → `Application` → `Domain` → `Infrastructure`, with its own Azure SQL database.

## Core Patterns

- **Strangler Fig** migration with Azure API Management (APIM) as the facade
- **Transactional Outbox** for reliable event publishing (no direct Service Bus publish)
- **Saga Orchestration** via MassTransit State Machine
- **Per-service databases** with CDC-based data decomposition
- **Event-driven async communication** via Azure Service Bus (Topics for pub/sub, Queues for commands)
- **CQRS** — Write services (Travel, Event, Payment) separated from read-optimized Reporting Service
- **Anti-Corruption Layer** — Payment Service wraps the legacy payment system in Phase 1

## Target Tech Stack

- .NET 8, Azure SQL Database, Azure Service Bus, Azure App Service
- React 18 SPA frontend
- Bicep/Terraform IaC, Azure DevOps CI/CD
- Application Insights + Serilog for observability
- MassTransit for messaging, MediatR for CQRS/mediator
- Entity Framework Core for data access

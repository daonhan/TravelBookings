# Plan: Docker & Docker Compose Development Environment

> Source PRD: `.github/prd-docker.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Target framework**: .NET 9.0 (as set in `Directory.Build.props`), Node 20 LTS for frontend
- **Base images**: `mcr.microsoft.com/dotnet/sdk:9.0` (build/dev), `mcr.microsoft.com/dotnet/aspnet:9.0` (runtime), `mcr.microsoft.com/mssql/server:2022-latest` (database), `node:20-alpine` (frontend build), `nginx:alpine` (frontend prod)
- **Docker Compose files**: `docker-compose.yml` (base) + `docker-compose.override.yml` (dev overrides)
- **Profiles**: `infra`, `backend`, `frontend`, `full`
- **Network**: Single Docker bridge network `travelbookings-net` for all containers
- **Gateway routes** (YARP):
  - `/api/bookings/**` -> `travelbooking-api:8080`
  - `/api/events/**` -> `eventmanagement-api:8080`
  - `/api/payments/**` -> `payment-api:8080`
  - `/api/reports/**` -> `reporting-api:8080`
  - `/api/notifications/**` -> `notification-api:8080`
  - `/hubs/**` -> `notification-api:8080` (WebSocket)
- **Service container names**: `travelbooking-api`, `eventmanagement-api`, `payment-api`, `reporting-api`, `notification-api`, `gateway-api`, `frontend`
- **Database container names**: `sql-travelbooking`, `sql-eventmanagement`, `sql-payment`, `sql-reporting`, `sql-notification`
- **Internal port**: All .NET services listen on port `8080` inside the container (ASP.NET 9 default)
- **Health endpoints**: `/health` (liveness) and `/health/ready` (readiness) — already implemented via `TravelBookings.Common.HealthChecks`
- **Configuration layering**: `appsettings.json` -> `appsettings.Docker.json` (via `ASPNETCORE_ENVIRONMENT=Docker`)
- **Database connection string pattern**: `Server=sql-{service};Database=TravelBookings_{Service};User Id=sa;Password=${SA_PASSWORD};TrustServerCertificate=True`
- **MassTransit transport**: Switch from in-memory to Azure Service Bus Emulator when `ConnectionStrings:ServiceBus` is populated (existing conditional logic)
- **EF Core migrations**: `Database.MigrateAsync()` on startup, gated by environment check
- **Solution structure**: Dockerfiles live at the repo root (to access `Directory.Build.props`, `Directory.Packages.props`, and Common projects), with build context set to repo root

---

## Phase 1: Single Service Tracer Bullet

**User stories**: 1, 2, 5, 9, 11, 13, 14

### What to build

Dockerize the TravelBooking service as a proof-of-concept that validates the entire container workflow end-to-end. Create a multi-stage Dockerfile (restore -> dev -> build -> prod stages), a SQL Server 2022 container, a minimal `docker-compose.yml`, the `.dockerignore` file, and an `appsettings.Docker.json`. Add EF Core initial migration for the TravelBooking service and wire up auto-migration on startup. The goal is one `docker compose up` command that starts the TravelBooking API connected to its own SQL Server, with health checks passing.

### Acceptance criteria

- [ ] Multi-stage Dockerfile for TravelBooking service builds successfully (both dev and prod targets)
- [ ] `docker compose up` starts TravelBooking API + SQL Server 2022 container
- [ ] SQL Server container has a Docker `HEALTHCHECK` and TravelBooking service waits for it via `depends_on: condition: service_healthy`
- [ ] `appsettings.Docker.json` configures connection string using Docker service hostname `sql-travelbooking`
- [ ] EF Core initial migration is created for `BookingDbContext` and runs automatically on service startup
- [ ] `/health` and `/health/ready` endpoints return healthy
- [ ] `.dockerignore` excludes `bin/`, `obj/`, `node_modules/`, `.git/`, `*.md`
- [ ] Serilog structured logs appear in `docker compose logs`

---

## Phase 2: All Backend Services + YARP Gateway

**User stories**: 1, 2, 4, 12, 19, 20, 23

### What to build

Extend the docker-compose stack to include all 5 microservices, each with its own SQL Server container and initial EF Core migration. Create the YARP API Gateway as a new lightweight .NET 9 project that routes requests by path prefix. All backend services should be reachable through the gateway on a single port. Add named Docker volumes for SQL Server data persistence.

### Acceptance criteria

- [ ] Dockerfiles for EventManagement, Payment, Notification, and Reporting services build successfully
- [ ] EF Core initial migrations created and auto-run for all 4 remaining services
- [ ] YARP Gateway project created with route configuration for all 5 services + SignalR hubs
- [ ] Gateway Dockerfile builds successfully
- [ ] `docker compose up` starts all 5 APIs + 5 SQL containers + gateway (7 containers total)
- [ ] All services' `/health` endpoints return healthy through the gateway (e.g., `GET gateway:8080/api/bookings/...`)
- [ ] Named volumes persist SQL Server data across `docker compose down` / `up` cycles
- [ ] Gateway correctly proxies WebSocket connections for `/hubs/*`
- [ ] All containers connected via `travelbookings-net` bridge network

---

## Phase 3: Frontend Container

**User stories**: 7, 8, 18

### What to build

Create a multi-stage Dockerfile for the React frontend with two usable targets: a dev target running Vite's dev server with HMR, and a prod target that builds static assets and serves them via Nginx. The Nginx configuration routes `/api/*` and `/hubs/*` requests to the YARP gateway. Add the frontend service to docker-compose.yml. After this phase, the full application is usable in a browser via Docker.

### Acceptance criteria

- [ ] Frontend Dockerfile builds successfully for both `dev` and `prod` targets
- [ ] Dev target: Vite dev server starts with HMR enabled, accessible on host port 5173
- [ ] Prod target: Nginx serves built React app, accessible on host port 80
- [ ] Nginx config reverse-proxies `/api/*` to gateway service
- [ ] Nginx config reverse-proxies `/hubs/*` to gateway with WebSocket upgrade headers
- [ ] Frontend can load in browser and make API calls that reach backend services through the gateway
- [ ] `.dockerignore` for frontend excludes `node_modules/`, `dist/`, `.git/`

---

## Phase 4: Azure Service Bus Emulator + Messaging

**User stories**: 3

### What to build

Add the Azure Service Bus Emulator container to the Docker Compose stack and configure all services to use it. The existing MassTransit configuration already conditionally switches from in-memory to Azure Service Bus when the `ServiceBus` connection string is populated — so the main work is adding the emulator container, populating the connection string in `appsettings.Docker.json`, and verifying inter-service message flow (e.g., creating a booking triggers the saga, which sends payment commands, which trigger notifications).

### Acceptance criteria

- [ ] Azure Service Bus Emulator container starts and is healthy
- [ ] `appsettings.Docker.json` for all services has the emulator's connection string
- [ ] MassTransit connects to the emulator (no in-memory fallback)
- [ ] Creating a booking via the TravelBooking API triggers the BookingSaga
- [ ] Saga sends `ProcessPaymentCommand` to Payment service via the emulator
- [ ] Notification service receives `BookingConfirmedEvent` and logs it
- [ ] Reporting service receives events and updates its read model
- [ ] Service Bus health check (`/health/ready`) passes on all services

---

## Phase 5: Developer Experience

**User stories**: 5, 6, 7, 10, 21, 24

### What to build

Create `docker-compose.override.yml` with development-specific overrides: volume mounts for source code, `dotnet watch` entrypoints for backend hot-reload, Vite dev target for frontend HMR, and exposed debug ports. Implement Docker Compose profiles so developers can selectively start subsets of the stack. Create a `.env` file for configurable values (ports, SA password, image tags).

### Acceptance criteria

- [ ] `docker compose up` (with override) starts all services in dev mode with hot-reload
- [ ] Changing a `.cs` file in a backend service triggers `dotnet watch` restart without rebuilding the container
- [ ] Changing a `.tsx` file in the frontend triggers Vite HMR without page reload
- [ ] `docker compose --profile infra up` starts only databases + broker
- [ ] `docker compose --profile backend up` starts infra + all APIs + gateway
- [ ] `docker compose --profile frontend up` starts infra + gateway + frontend
- [ ] `docker compose --profile full up` starts everything
- [ ] Debug ports are exposed in override (one per service) for remote debugger attachment
- [ ] `.env` file contains configurable SA_PASSWORD, host ports, and other environment-specific values
- [ ] `docker compose -f docker-compose.yml up` (without override) runs in production-like mode
- [ ] `docker compose --profile full up --build` rebuilds all images from scratch

---

## Phase 6: Testing Infrastructure

**User stories**: 15, 16, 17, 22

### What to build

Create a comprehensive test infrastructure that validates the Docker setup at three levels: (1) a build smoke test script that verifies all Dockerfiles build successfully, (2) integration tests that verify services connect to their databases and the message broker and respond on health endpoints, and (3) Playwright E2E tests that run against the full Docker Compose stack to validate user workflows. Include a test-specific Compose profile or file for CI use.

### Acceptance criteria

- [ ] Build smoke test script runs `docker compose build` and reports success/failure for each image
- [ ] Integration tests verify each service's database connectivity (EF Core can query)
- [ ] Integration tests verify each service's health endpoint returns healthy
- [ ] Integration tests verify message broker connectivity (publish/consume a test message)
- [ ] Playwright E2E tests run against the Docker Compose stack (frontend + all backends)
- [ ] E2E tests cover at least one critical workflow (e.g., create a booking, view it in reporting)
- [ ] Test infrastructure works in CI (no Docker-in-Docker dependency, uses `docker compose` directly)
- [ ] A `test` profile or `docker-compose.test.yml` spins up the stack + runs tests + exits with appropriate exit code
- [ ] Test results are reported in a CI-friendly format (JUnit XML or similar)

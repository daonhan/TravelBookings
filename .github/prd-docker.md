## Problem Statement

Developers currently must manually start each of the 5 microservices individually, configure SQL Server LocalDB for each service's database, and cannot test inter-service messaging locally (Azure Service Bus connection strings are empty). There is no standardized way to bring up the full stack — making local development, integration testing, and new developer onboarding painful and error-prone.

## Solution

Dockerize all 5 microservices and the React 18 SPA frontend, then orchestrate them with Docker Compose. The setup includes:

- **Multi-stage Dockerfiles** for each service and the frontend, supporting both development (hot-reload via `dotnet watch` and Vite HMR) and production-like (optimized builds served via Nginx) modes
- **YARP API Gateway** as a single entry point routing `/api/*` to the correct backend service
- **Azure Service Bus Emulator** for local inter-service messaging
- **Per-service SQL Server 2022 containers** for full database isolation
- **Docker Compose profiles** for selective service startup (e.g., frontend-only, single service, full stack)
- **Auto-running EF Core migrations** on service startup
- **Basic health checks** on all services

## User Stories

1. As a developer, I want to run `docker compose up` to start the entire TravelBookings stack locally, so that I don't have to manually start each service one by one
2. As a developer, I want each microservice to have its own SQL Server container, so that database isolation matches the production architecture
3. As a developer, I want a local message broker (Azure Service Bus Emulator), so that I can test inter-service communication workflows locally
4. As a developer, I want a YARP API gateway in the Docker stack, so that the frontend can talk to a single endpoint instead of multiple service ports
5. As a developer, I want multi-stage Dockerfiles with dev and prod targets, so that I can choose between hot-reload for development and optimized builds for production-like testing
6. As a developer, I want `dotnet watch` with volume mounts in dev mode, so that my backend code changes are reflected without rebuilding containers
7. As a developer, I want Vite HMR in the frontend dev container, so that my React changes are instantly reflected in the browser
8. As a developer, I want the frontend prod target to build static assets and serve them via Nginx, so that I can test production-like frontend behavior locally
9. As a developer, I want EF Core migrations to run automatically when services start, so that databases are always up-to-date without manual steps
10. As a developer, I want Docker Compose profiles (e.g., `--profile frontend`, `--profile full`), so that I can spin up only the services I need and save system resources
11. As a developer, I want health check endpoints exposed on all services, so that Docker can monitor container health and I can verify services are running correctly
12. As a new team member, I want a single `docker compose up` command to get a working development environment, so that onboarding takes minutes instead of hours
13. As a developer, I want `.dockerignore` files, so that Docker builds are fast and don't include unnecessary files like `node_modules` or `bin/obj`
14. As a developer, I want `appsettings.Docker.json` configuration per service, so that connection strings and service URLs are correctly configured for the Docker network
15. As a developer, I want Docker build smoke tests, so that CI can verify all Dockerfiles build successfully
16. As a developer, I want integration tests that run against the Docker Compose stack, so that I can verify services can communicate with their databases and the message broker
17. As a developer, I want Playwright E2E tests running against the Docker Compose stack, so that I can validate full user workflows end-to-end
18. As a developer, I want the Nginx reverse proxy in the frontend prod container to route `/api/*` requests to the YARP gateway, so that the frontend works correctly in production mode
19. As a developer, I want the Docker Compose setup to use named volumes for SQL Server data, so that database state persists across container restarts
20. As a developer, I want the YARP gateway to forward SignalR/WebSocket connections (`/hubs/*`) to the Notification service, so that real-time features work in Docker
21. As a developer, I want to be able to run `docker compose --profile full up --build` to force rebuild all images after dependency changes, so that I can easily pick up NuGet/npm package updates
22. As a CI engineer, I want the Docker Compose setup to work in CI pipelines, so that integration and E2E tests can run in automated builds
23. As a developer, I want each service container to output structured Serilog logs to stdout, so that `docker compose logs` gives me useful debugging information
24. As a developer, I want the docker-compose.override.yml to expose debug ports, so that I can attach a debugger to running containers

## Implementation Decisions

### Architecture
- **YARP API Gateway**: A new lightweight .NET 9 project (`src/Gateway/Gateway.API`) that uses YARP reverse proxy to route API requests to backend services by path prefix (`/api/bookings` -> TravelBooking service, `/api/events` -> EventManagement service, etc.)
- **Per-service SQL Server 2022 containers**: Each of the 5 microservices gets its own `mcr.microsoft.com/mssql/server:2022-latest` container, matching the production per-service database pattern
- **Azure Service Bus Emulator**: Official Microsoft emulator container for local messaging, replacing empty connection strings with a working local broker
- **Frontend multi-stage**: Dev target runs Vite dev server with HMR; prod target uses `npm run build` then serves via `nginx:alpine`

### Docker Compose Structure
- `docker-compose.yml`: Base service definitions (all services, databases, broker, gateway, frontend)
- `docker-compose.override.yml`: Development overrides (volume mounts for source code, `dotnet watch` entrypoint, debug ports, Vite dev server target)
- Profiles: `infra` (databases + broker only), `backend` (infra + all APIs), `frontend` (infra + gateway + frontend), `full` (everything)

### Configuration
- Each service gets an `appsettings.Docker.json` that overrides connection strings to use Docker network hostnames (e.g., `Server=sql-travelbooking;...`) and service URLs to use Docker service names
- Environment variables in docker-compose for secrets (SA_PASSWORD, API keys)
- `.env` file for configurable values (ports, image tags)

### Multi-stage Dockerfile Pattern (Backend Services)
- **Stage 1 (restore)**: Copy `.csproj` files, restore NuGet packages (cached layer)
- **Stage 2 (dev)**: Based on SDK image, `ENTRYPOINT ["dotnet", "watch", "run"]` with volume-mounted source
- **Stage 3 (build)**: Full build and publish
- **Stage 4 (prod)**: Based on ASP.NET runtime image, copy published output, configure health check

### Multi-stage Dockerfile Pattern (Frontend)
- **Stage 1 (deps)**: Copy `package.json` + `package-lock.json`, run `npm ci` (cached layer)
- **Stage 2 (dev)**: Based on Node image, `CMD ["npm", "run", "dev"]` with volume-mounted source
- **Stage 3 (build)**: Run `npm run build`
- **Stage 4 (prod)**: Based on `nginx:alpine`, copy built assets + nginx.conf with reverse proxy rules

### Health Checks
- Docker `HEALTHCHECK` instruction in each Dockerfile hitting the ASP.NET health endpoint
- `depends_on` with `condition: service_healthy` for proper startup ordering (services wait for their SQL Server to be healthy)

### Database Migrations
- Services call `Database.MigrateAsync()` on startup in their `Program.cs` (or a hosted service) when running in Docker environment
- Startup ordering via `depends_on` ensures SQL Server is ready before services attempt migration

### Testing
- **Build smoke tests**: Script that runs `docker compose build` and verifies all images build successfully
- **Integration tests**: Docker Compose-based tests verifying database connectivity, API health endpoints, and message broker connectivity
- **E2E tests**: Playwright tests running against the full Docker Compose stack (frontend + all backends)
- Test compose file or profile for CI that includes test runner containers

## Out of Scope

- Production deployment configuration (Kubernetes, Azure Container Apps, AKS manifests)
- SSL/TLS certificates for local Docker development (services use HTTP internally)
- Container registry setup and image publishing pipelines
- Azure DevOps / GitHub Actions CI/CD pipeline changes (the Docker setup should work in CI, but pipeline YAML changes are separate)
- Monitoring dashboards (Grafana, Prometheus) — basic health checks are included but full observability stack is not
- Secret management (Azure Key Vault integration) — development uses plain environment variables
- Performance tuning of Docker containers (memory limits, CPU constraints)
- Windows container support — Linux containers only
- Database seeding with test data (migrations only, seed data is separate)

## Further Notes

- The Azure Service Bus Emulator is relatively new. If it proves unstable, RabbitMQ with MassTransit's RabbitMQ transport is a well-tested fallback that requires minimal code changes.
- SQL Server 2022 containers require a minimum of 2GB RAM each. With 5 separate instances, the full stack needs at least 10GB RAM allocated to Docker. Developers with limited resources should use profiles to run only the services they need.
- The YARP gateway is intended for local development only and should NOT be deployed to production — Azure API Management (APIM) serves this role in the production architecture.
- The `docker-compose.override.yml` approach means `docker compose up` automatically uses dev mode. For production-like testing, use `docker compose -f docker-compose.yml up` (without the override).
- All backend services share the same Dockerfile template since they follow the same Clean Architecture structure. A shared Dockerfile with build args for the service name could reduce duplication.

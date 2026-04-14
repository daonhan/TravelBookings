# ---- Stage 1: restore ----
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS restore
WORKDIR /src

# Copy solution-level files needed for restore
COPY Directory.Build.props Directory.Packages.props ./

# Copy project files for restore (cached layer)
COPY src/Common/TravelBookings.Common.Events/TravelBookings.Common.Events.csproj src/Common/TravelBookings.Common.Events/
COPY src/Common/TravelBookings.Common.HealthChecks/TravelBookings.Common.HealthChecks.csproj src/Common/TravelBookings.Common.HealthChecks/
COPY src/Common/TravelBookings.Common.Logging/TravelBookings.Common.Logging.csproj src/Common/TravelBookings.Common.Logging/
COPY src/Common/TravelBookings.Common.Security/TravelBookings.Common.Security.csproj src/Common/TravelBookings.Common.Security/
COPY src/Services/TravelBooking/TravelBooking.Domain/TravelBooking.Domain.csproj src/Services/TravelBooking/TravelBooking.Domain/
COPY src/Services/TravelBooking/TravelBooking.Application/TravelBooking.Application.csproj src/Services/TravelBooking/TravelBooking.Application/
COPY src/Services/TravelBooking/TravelBooking.Infrastructure/TravelBooking.Infrastructure.csproj src/Services/TravelBooking/TravelBooking.Infrastructure/
COPY src/Services/TravelBooking/TravelBooking.API/TravelBooking.API.csproj src/Services/TravelBooking/TravelBooking.API/

RUN dotnet restore src/Services/TravelBooking/TravelBooking.API/TravelBooking.API.csproj

# ---- Stage 2: dev (hot-reload via dotnet watch) ----
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dev
WORKDIR /src

COPY --from=restore /src .
COPY . .

ENV ASPNETCORE_ENVIRONMENT=Docker
EXPOSE 8080

ENTRYPOINT ["dotnet", "watch", "run", "--project", "src/Services/TravelBooking/TravelBooking.API/TravelBooking.API.csproj", "--urls", "http://0.0.0.0:8080"]

# ---- Stage 3: build ----
FROM restore AS build
WORKDIR /src

COPY . .

RUN dotnet publish src/Services/TravelBooking/TravelBooking.API/TravelBooking.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ---- Stage 4: prod ----
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS prod

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Docker
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "TravelBooking.API.dll"]

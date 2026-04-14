FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

# Copy central package management files
COPY Directory.Build.props Directory.Packages.props ./

# Copy test project
COPY tests/Docker.IntegrationTests/Docker.IntegrationTests.csproj tests/Docker.IntegrationTests/

# Restore
RUN dotnet restore tests/Docker.IntegrationTests/Docker.IntegrationTests.csproj

# Copy test source
COPY tests/Docker.IntegrationTests/ tests/Docker.IntegrationTests/

WORKDIR /src/tests/Docker.IntegrationTests

# Run tests on container start, output JUnit XML
ENTRYPOINT ["dotnet", "test", "--no-restore", "--logger", "trx;LogFileName=integration-results.trx", "--logger", "junit;LogFileName=integration-results.xml", "--results-directory", "/app/TestResults"]

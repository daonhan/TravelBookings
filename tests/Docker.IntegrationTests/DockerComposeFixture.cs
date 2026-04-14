namespace Docker.IntegrationTests;

/// <summary>
/// Shared test fixture that provides HTTP clients and connection details
/// for the running Docker Compose stack. The stack must already be running
/// before tests execute — this fixture does NOT start Docker Compose.
/// </summary>
public class DockerComposeFixture : IAsyncLifetime
{
    public HttpClient HttpClient { get; private set; } = null!;

    /// <summary>Gateway base URL (services are accessed through the YARP gateway).</summary>
    public string GatewayBaseUrl { get; } =
        Environment.GetEnvironmentVariable("GATEWAY_BASE_URL") ?? "http://localhost:8080";

    /// <summary>SA password used for all SQL Server containers.</summary>
    public string SaPassword { get; } =
        Environment.GetEnvironmentVariable("SA_PASSWORD") ?? "SqlServer2022!";

    /// <summary>
    /// SQL Server connection details keyed by service name.
    /// When running inside Docker, hosts resolve to container names (sql-travelbooking, etc.)
    /// and all use port 1433. When running from the host, use localhost with mapped ports.
    /// </summary>
    public Dictionary<string, (string Host, int Port, string Database)> Databases { get; } = new()
    {
        ["TravelBooking"] = (
            Environment.GetEnvironmentVariable("SQL_TRAVELBOOKING_HOST") ?? "localhost",
            int.Parse(Environment.GetEnvironmentVariable("SQL_TRAVELBOOKING_HOST_PORT") ?? "1433"),
            "TravelBookings_TravelBooking"),
        ["EventManagement"] = (
            Environment.GetEnvironmentVariable("SQL_EVENTMANAGEMENT_HOST") ?? "localhost",
            int.Parse(Environment.GetEnvironmentVariable("SQL_EVENTMANAGEMENT_HOST_PORT") ?? "1434"),
            "TravelBookings_EventManagement"),
        ["Payment"] = (
            Environment.GetEnvironmentVariable("SQL_PAYMENT_HOST") ?? "localhost",
            int.Parse(Environment.GetEnvironmentVariable("SQL_PAYMENT_HOST_PORT") ?? "1435"),
            "TravelBookings_Payment"),
        ["Notification"] = (
            Environment.GetEnvironmentVariable("SQL_NOTIFICATION_HOST") ?? "localhost",
            int.Parse(Environment.GetEnvironmentVariable("SQL_NOTIFICATION_HOST_PORT") ?? "1436"),
            "TravelBookings_Notification"),
        ["Reporting"] = (
            Environment.GetEnvironmentVariable("SQL_REPORTING_HOST") ?? "localhost",
            int.Parse(Environment.GetEnvironmentVariable("SQL_REPORTING_HOST_PORT") ?? "1437"),
            "TravelBookings_Reporting"),
    };

    /// <summary>
    /// Direct service URLs (bypassing gateway) keyed by service name.
    /// </summary>
    public Dictionary<string, string> ServiceUrls { get; } = new()
    {
        ["TravelBooking"] = Environment.GetEnvironmentVariable("TRAVELBOOKING_URL") ?? "http://localhost:5001",
        ["EventManagement"] = Environment.GetEnvironmentVariable("EVENTMANAGEMENT_URL") ?? "http://localhost:5002",
        ["Payment"] = Environment.GetEnvironmentVariable("PAYMENT_URL") ?? "http://localhost:5003",
        ["Notification"] = Environment.GetEnvironmentVariable("NOTIFICATION_URL") ?? "http://localhost:5004",
        ["Reporting"] = Environment.GetEnvironmentVariable("REPORTING_URL") ?? "http://localhost:5005",
    };

    public string GetConnectionString(string serviceName)
    {
        var db = Databases[serviceName];
        return $"Server={db.Host},{db.Port};Database={db.Database};User Id=sa;Password={SaPassword};TrustServerCertificate=True;Connect Timeout=10";
    }

    public Task InitializeAsync()
    {
        HttpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(30)
        };
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        HttpClient.Dispose();
        return Task.CompletedTask;
    }
}

[CollectionDefinition("DockerCompose")]
public class DockerComposeCollection : ICollectionFixture<DockerComposeFixture>
{
}

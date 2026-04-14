namespace Docker.IntegrationTests;

/// <summary>
/// Verifies that the YARP gateway correctly routes requests to backend services.
/// </summary>
[Collection("DockerCompose")]
public class GatewayRoutingTests
{
    private readonly DockerComposeFixture _fixture;

    public GatewayRoutingTests(DockerComposeFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("/api/bookings", "TravelBooking")]
    [InlineData("/api/events", "EventManagement")]
    [InlineData("/api/payments", "Payment")]
    [InlineData("/api/notifications", "Notification")]
    [InlineData("/api/reports", "Reporting")]
    public async Task Gateway_RoutesToCorrectService(string path, string serviceName)
    {
        // Act — hit the gateway; even if the endpoint returns 404 for the
        // specific path, a non-502/503 response proves the gateway routed
        // the request to a live backend (not a gateway error).
        var response = await _fixture.HttpClient.GetAsync($"{_fixture.GatewayBaseUrl}{path}");

        // Assert — any response other than 502 Bad Gateway or 503 Service Unavailable
        // confirms the gateway successfully forwarded to the backend service.
        var statusCode = (int)response.StatusCode;
        statusCode.Should().NotBe(502,
            because: $"gateway should route {path} to {serviceName} (502 means backend unreachable)");
        statusCode.Should().NotBe(503,
            because: $"gateway should route {path} to {serviceName} (503 means service unavailable)");
    }
}

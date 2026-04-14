namespace Docker.IntegrationTests;

/// <summary>
/// Verifies that the Azure Service Bus Emulator is running and that
/// services can connect to the message broker.
/// </summary>
[Collection("DockerCompose")]
public class MessageBrokerTests
{
    private readonly DockerComposeFixture _fixture;

    public MessageBrokerTests(DockerComposeFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task ServiceBusEmulator_IsReachable()
    {
        // The Service Bus emulator exposes an HTTP endpoint on port 5672
        // that returns a response when healthy.
        var serviceBusUrl = Environment.GetEnvironmentVariable("SERVICEBUS_URL")
            ?? "http://localhost:5672";

        // Act
        var response = await _fixture.HttpClient.GetAsync(serviceBusUrl);

        // Assert - the emulator responds (any HTTP response means it's running)
        ((int)response.StatusCode).Should().BeLessThan(500,
            because: "the Service Bus emulator should be running and responding");
    }

    [Theory]
    [InlineData("TravelBooking")]
    [InlineData("EventManagement")]
    [InlineData("Payment")]
    [InlineData("Notification")]
    [InlineData("Reporting")]
    public async Task Service_ServiceBusHealthCheck_IsHealthy(string serviceName)
    {
        // The readiness endpoint includes the Service Bus health check.
        // If MassTransit is connected to the emulator, /health/ready returns Healthy.
        var baseUrl = _fixture.ServiceUrls[serviceName];

        // Act
        var response = await _fixture.HttpClient.GetAsync($"{baseUrl}/health/ready");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Be("Healthy",
            because: $"{serviceName} should have a healthy Service Bus connection");
    }
}

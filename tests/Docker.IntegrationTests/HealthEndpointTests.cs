namespace Docker.IntegrationTests;

/// <summary>
/// Verifies that all service health endpoints return healthy responses.
/// Tests both direct service access and access through the YARP gateway.
/// </summary>
[Collection("DockerCompose")]
public class HealthEndpointTests
{
    private readonly DockerComposeFixture _fixture;

    public HealthEndpointTests(DockerComposeFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("TravelBooking")]
    [InlineData("EventManagement")]
    [InlineData("Payment")]
    [InlineData("Notification")]
    [InlineData("Reporting")]
    public async Task Service_HealthEndpoint_ReturnsHealthy(string serviceName)
    {
        // Arrange
        var baseUrl = _fixture.ServiceUrls[serviceName];

        // Act
        var response = await _fixture.HttpClient.GetAsync($"{baseUrl}/health");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Be("Healthy");
    }

    [Theory]
    [InlineData("TravelBooking")]
    [InlineData("EventManagement")]
    [InlineData("Payment")]
    [InlineData("Notification")]
    [InlineData("Reporting")]
    public async Task Service_ReadinessEndpoint_ReturnsHealthy(string serviceName)
    {
        // Arrange
        var baseUrl = _fixture.ServiceUrls[serviceName];

        // Act
        var response = await _fixture.HttpClient.GetAsync($"{baseUrl}/health/ready");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Be("Healthy");
    }

    [Fact]
    public async Task Gateway_HealthEndpoint_ReturnsHealthy()
    {
        // Act
        var response = await _fixture.HttpClient.GetAsync($"{_fixture.GatewayBaseUrl}/health");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
    }
}

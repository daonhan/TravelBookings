using Microsoft.Data.SqlClient;

namespace Docker.IntegrationTests;

/// <summary>
/// Verifies that each microservice's SQL Server database is accessible
/// and that EF Core migrations have run (tables exist).
/// </summary>
[Collection("DockerCompose")]
public class DatabaseConnectivityTests
{
    private readonly DockerComposeFixture _fixture;

    public DatabaseConnectivityTests(DockerComposeFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("TravelBooking")]
    [InlineData("EventManagement")]
    [InlineData("Payment")]
    [InlineData("Notification")]
    [InlineData("Reporting")]
    public async Task Database_CanConnect_AndQuerySucceeds(string serviceName)
    {
        // Arrange
        var connectionString = _fixture.GetConnectionString(serviceName);

        // Act & Assert
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT 1";
        var result = await command.ExecuteScalarAsync();

        result.Should().Be(1);
    }

    [Theory]
    [InlineData("TravelBooking")]
    [InlineData("EventManagement")]
    [InlineData("Payment")]
    [InlineData("Notification")]
    [InlineData("Reporting")]
    public async Task Database_EFCoreMigrations_HaveRun(string serviceName)
    {
        // Arrange
        var connectionString = _fixture.GetConnectionString(serviceName);

        // Act - check that the EF Core migrations history table exists
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = @"
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_NAME = '__EFMigrationsHistory'";
        var result = await command.ExecuteScalarAsync();

        // Assert - migrations history table should exist
        ((int)result!).Should().BeGreaterOrEqualTo(1,
            because: $"EF Core migrations should have run for {serviceName}, creating the __EFMigrationsHistory table");
    }

    [Theory]
    [InlineData("TravelBooking")]
    [InlineData("EventManagement")]
    [InlineData("Payment")]
    [InlineData("Notification")]
    [InlineData("Reporting")]
    public async Task Database_HasApplicationTables(string serviceName)
    {
        // Arrange
        var connectionString = _fixture.GetConnectionString(serviceName);

        // Act - check that the database has more than just the migrations table
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = @"
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'dbo'
              AND TABLE_TYPE = 'BASE TABLE'
              AND TABLE_NAME != '__EFMigrationsHistory'";
        var result = await command.ExecuteScalarAsync();

        // Assert - should have at least one application table
        ((int)result!).Should().BeGreaterOrEqualTo(1,
            because: $"{serviceName} should have application tables created by EF Core migrations");
    }
}

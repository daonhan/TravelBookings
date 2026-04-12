using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace TravelBookings.Common.HealthChecks;

public static class HealthCheckExtensions
{
    public static IServiceCollection AddPhoenixHealthChecks(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var builder = services.AddHealthChecks();

        string? sqlConnection = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrEmpty(sqlConnection))
        {
            builder.AddSqlServer(
                sqlConnection,
                name: "database",
                tags: ["ready"]);
        }

        string? serviceBusConnection = configuration.GetConnectionString("ServiceBus");
        if (!string.IsNullOrEmpty(serviceBusConnection))
        {
            builder.AddAzureServiceBusQueue(
                serviceBusConnection,
                queueName: "health-check",
                name: "servicebus",
                tags: ["ready"]);
        }

        return services;
    }

    public static WebApplication MapPhoenixHealthChecks(this WebApplication app)
    {
        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            Predicate = _ => true
        });

        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready")
        });

        return app;
    }
}

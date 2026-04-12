using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Events;

namespace TravelBookings.Common.Logging;

public static class SerilogConfiguration
{
    public static LoggerConfiguration CreateDefaultConfiguration(
        IConfiguration configuration,
        string serviceName)
    {
        return new LoggerConfiguration()
            .ReadFrom.Configuration(configuration)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithThreadId()
            .Enrich.WithProperty("ServiceId", serviceName)
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
            .MinimumLevel.Override("System", LogEventLevel.Warning)
            .WriteTo.Console(outputTemplate:
                "[{Timestamp:HH:mm:ss} {Level:u3}] [{ServiceId}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}");
    }
}

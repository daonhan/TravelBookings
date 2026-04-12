using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using MediatR;

namespace TravelBookings.Common.Logging;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPhoenixLogging(this IServiceCollection services)
    {
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        return services;
    }

    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
    {
        return app.UseMiddleware<CorrelationIdMiddleware>();
    }
}

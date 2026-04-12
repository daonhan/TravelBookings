using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Reporting.Domain.Interfaces;
using Reporting.Infrastructure.Consumers;
using Reporting.Infrastructure.Persistence;
using Reporting.Infrastructure.Repositories;

namespace Reporting.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ReportingDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ReportingDbContext).Assembly.FullName)));

        services.AddScoped<IBookingSummaryRepository, BookingSummaryRepository>();
        services.AddScoped<IEventSummaryRepository, EventSummaryRepository>();
        services.AddScoped<IRevenueRepository, RevenueRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ReportingDbContext>());

        services.AddMassTransit(x =>
        {
            x.AddConsumer<BookingConfirmedProjector>();
            x.AddConsumer<BookingCancelledProjector>();
            x.AddConsumer<EventCreatedProjector>();
            x.AddConsumer<PaymentProcessedProjector>();

            x.AddEntityFrameworkOutbox<ReportingDbContext>(o =>
            {
                o.UseSqlServer();
                o.UseBusOutbox();
            });

            var serviceBusConnection = configuration.GetConnectionString("ServiceBus");
            if (!string.IsNullOrEmpty(serviceBusConnection))
            {
                x.UsingAzureServiceBus((context, cfg) =>
                {
                    cfg.Host(serviceBusConnection);
                    cfg.ConfigureEndpoints(context);
                });
            }
            else
            {
                x.UsingInMemory((context, cfg) =>
                {
                    cfg.ConfigureEndpoints(context);
                });
            }
        });

        return services;
    }
}

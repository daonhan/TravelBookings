using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TravelBooking.Domain.Interfaces;
using TravelBooking.Infrastructure.Consumers;
using TravelBooking.Infrastructure.Persistence;
using TravelBooking.Infrastructure.Repositories;
using TravelBooking.Infrastructure.Resilience;
using TravelBooking.Infrastructure.Saga;

namespace TravelBooking.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // EF Core
        services.AddDbContext<BookingDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(BookingDbContext).Assembly.FullName)));

        // Repositories
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<BookingDbContext>());

        // MassTransit
        services.AddMassTransit(x =>
        {
            x.AddConsumer<ReserveInventoryConsumer>();
            x.AddConsumer<ReleaseInventoryConsumer>();

            x.AddSagaStateMachine<BookingSaga, BookingSagaState>()
                .EntityFrameworkRepository(r =>
                {
                    r.ConcurrencyMode = ConcurrencyMode.Optimistic;
                    r.ExistingDbContext<BookingDbContext>();
                    r.UseSqlServer();
                });

            x.AddEntityFrameworkOutbox<BookingDbContext>(o =>
            {
                o.QueryDelay = TimeSpan.FromSeconds(1);
                o.UseSqlServer();
                o.UseBusOutbox();
            });

            // Use in-memory transport for local dev, Azure Service Bus for production
            string? serviceBusConnection = configuration.GetConnectionString("ServiceBus");
            if (!string.IsNullOrEmpty(serviceBusConnection))
            {
                x.UsingAzureServiceBus((context, cfg) =>
                {
                    cfg.Host(serviceBusConnection);
                    cfg.UseServiceBusMessageScheduler();
                    cfg.ConfigureEndpoints(context);
                });
            }
            else
            {
                x.UsingInMemory((context, cfg) =>
                {
                    cfg.UseDelayedMessageScheduler();
                    cfg.ConfigureEndpoints(context);
                });
            }
        });

        // Payment HTTP client with Polly resilience
        services.AddHttpClient("PaymentService", client =>
        {
            client.BaseAddress = new Uri(
                configuration["Services:Payment:BaseUrl"] ?? "https://localhost:5003");
            client.Timeout = TimeSpan.FromSeconds(10);
        }).AddPaymentResilienceHandler();

        return services;
    }
}

using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using EventManagement.Domain.Interfaces;
using EventManagement.Infrastructure.Consumers;
using EventManagement.Infrastructure.Persistence;
using EventManagement.Infrastructure.Repositories;

namespace EventManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // EF Core
        services.AddDbContext<EventManagementDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(EventManagementDbContext).Assembly.FullName)));

        // Repositories
        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<EventManagementDbContext>());

        // MassTransit
        services.AddMassTransit(x =>
        {
            x.AddConsumer<ReserveInventoryConsumer>();
            x.AddConsumer<ReleaseInventoryConsumer>();

            x.AddEntityFrameworkOutbox<EventManagementDbContext>(o =>
            {
                o.QueryDelay = TimeSpan.FromSeconds(1);
                o.UseSqlServer();
                o.UseBusOutbox();
            });

            string? serviceBusConnection = configuration.GetConnectionString("ServiceBus");
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

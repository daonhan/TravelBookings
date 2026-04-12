using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Notification.Domain.Interfaces;
using Notification.Infrastructure.Consumers;
using Notification.Infrastructure.Persistence;
using Notification.Infrastructure.Repositories;

namespace Notification.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<NotificationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(NotificationDbContext).Assembly.FullName)));

        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<ITemplateRepository, TemplateRepository>();
        services.AddScoped<IUserPreferenceRepository, UserPreferenceRepository>();
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<NotificationDbContext>());

        services.AddMassTransit(x =>
        {
            x.AddConsumer<BookingConfirmedConsumer>();
            x.AddConsumer<BookingCancelledConsumer>();
            x.AddConsumer<PaymentProcessedConsumer>();
            x.AddConsumer<AttendeeRegisteredConsumer>();

            x.AddEntityFrameworkOutbox<NotificationDbContext>(o =>
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

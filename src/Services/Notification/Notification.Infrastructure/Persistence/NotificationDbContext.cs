using MassTransit;
using Microsoft.EntityFrameworkCore;
using Notification.Domain.Entities;
using Notification.Domain.Interfaces;

namespace Notification.Infrastructure.Persistence;

public class NotificationDbContext : DbContext, IUnitOfWork
{
    public DbSet<NotificationLog> Notifications => Set<NotificationLog>();
    public DbSet<NotificationTemplate> Templates => Set<NotificationTemplate>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();

    public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NotificationDbContext).Assembly);
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();
    }
}

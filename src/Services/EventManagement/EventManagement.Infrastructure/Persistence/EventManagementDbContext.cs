using MassTransit;
using Microsoft.EntityFrameworkCore;
using EventManagement.Domain.Entities;
using EventManagement.Domain.Interfaces;

namespace EventManagement.Infrastructure.Persistence;

public class EventManagementDbContext : DbContext, IUnitOfWork
{
    public DbSet<OrgEvent> Events => Set<OrgEvent>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Registration> Registrations => Set<Registration>();

    public EventManagementDbContext(DbContextOptions<EventManagementDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EventManagementDbContext).Assembly);

        // MassTransit Outbox + Inbox entities
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();
    }
}

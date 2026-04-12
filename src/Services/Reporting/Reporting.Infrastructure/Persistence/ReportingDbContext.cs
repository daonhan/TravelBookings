using MassTransit;
using Microsoft.EntityFrameworkCore;
using Reporting.Domain.Interfaces;
using Reporting.Domain.ReadModels;

namespace Reporting.Infrastructure.Persistence;

public class ReportingDbContext : DbContext, IUnitOfWork
{
    public DbSet<BookingSummary> BookingSummaries => Set<BookingSummary>();
    public DbSet<EventSummary> EventSummaries => Set<EventSummary>();
    public DbSet<RevenueRecord> RevenueRecords => Set<RevenueRecord>();

    public ReportingDbContext(DbContextOptions<ReportingDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReportingDbContext).Assembly);
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();
    }
}

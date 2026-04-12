using MassTransit;
using Microsoft.EntityFrameworkCore;
using Payment.Domain.Entities;
using Payment.Domain.Interfaces;

namespace Payment.Infrastructure.Persistence;

public class PaymentDbContext : DbContext, IUnitOfWork
{
    public DbSet<PaymentRecord> Payments => Set<PaymentRecord>();
    public DbSet<PaymentTransaction> Transactions => Set<PaymentTransaction>();

    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PaymentDbContext).Assembly);

        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();
    }
}

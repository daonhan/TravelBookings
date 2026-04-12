using MassTransit;
using Microsoft.EntityFrameworkCore;
using TravelBooking.Domain.Entities;
using TravelBooking.Domain.Interfaces;

namespace TravelBooking.Infrastructure.Persistence;

public class BookingDbContext : DbContext, IUnitOfWork
{
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Itinerary> Itineraries => Set<Itinerary>();
    public DbSet<Passenger> Passengers => Set<Passenger>();
    public DbSet<Allocation> Allocations => Set<Allocation>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();

    public BookingDbContext(DbContextOptions<BookingDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BookingDbContext).Assembly);

        // MassTransit Outbox + Inbox entities
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();
    }
}

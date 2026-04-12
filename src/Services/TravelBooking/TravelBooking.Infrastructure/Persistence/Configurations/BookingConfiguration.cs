using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelBooking.Domain.Entities;

namespace TravelBooking.Infrastructure.Persistence.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.UserId).IsRequired().HasMaxLength(100);
        builder.Property(b => b.Status).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(b => b.PaymentReference).HasMaxLength(200);
        builder.Property(b => b.RowVersion).IsRowVersion();

        builder.OwnsOne(b => b.TotalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalAmount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("Currency").HasMaxLength(3);
        });

        builder.HasMany(b => b.Itineraries)
            .WithOne()
            .HasForeignKey(i => i.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(b => b.Passengers)
            .WithOne()
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(b => b.DomainEvents);

        builder.HasIndex(b => b.UserId);
        builder.HasIndex(b => b.Status);
    }
}

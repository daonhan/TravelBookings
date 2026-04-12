using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reporting.Domain.ReadModels;

namespace Reporting.Infrastructure.Persistence.Configurations;

public class BookingSummaryConfiguration : IEntityTypeConfiguration<BookingSummary>
{
    public void Configure(EntityTypeBuilder<BookingSummary> builder)
    {
        builder.ToTable("BookingSummaries");
        builder.HasKey(b => b.Id);

        builder.Property(b => b.UserId).IsRequired().HasMaxLength(100);
        builder.Property(b => b.Destination).HasMaxLength(500);
        builder.Property(b => b.Currency).HasMaxLength(10);
        builder.Property(b => b.Status).HasMaxLength(50);
        builder.Property(b => b.TotalAmount).HasPrecision(18, 2);
        builder.Property(b => b.CancellationReason).HasMaxLength(1000);

        builder.HasIndex(b => b.BookingId).IsUnique();
        builder.HasIndex(b => b.UserId);
        builder.HasIndex(b => b.CreatedAt);
    }
}

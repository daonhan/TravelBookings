using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reporting.Domain.ReadModels;

namespace Reporting.Infrastructure.Persistence.Configurations;

public class RevenueRecordConfiguration : IEntityTypeConfiguration<RevenueRecord>
{
    public void Configure(EntityTypeBuilder<RevenueRecord> builder)
    {
        builder.ToTable("RevenueRecords");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.UserId).IsRequired().HasMaxLength(100);
        builder.Property(r => r.Currency).HasMaxLength(10);
        builder.Property(r => r.PaymentMethod).HasMaxLength(50);
        builder.Property(r => r.Status).HasMaxLength(50);
        builder.Property(r => r.Amount).HasPrecision(18, 2);

        builder.HasIndex(r => r.PaymentId).IsUnique();
        builder.HasIndex(r => r.BookingId);
        builder.HasIndex(r => r.ProcessedAt);
    }
}

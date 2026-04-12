using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Payment.Domain.Entities;

namespace Payment.Infrastructure.Persistence.Configurations;

public class PaymentRecordConfiguration : IEntityTypeConfiguration<PaymentRecord>
{
    public void Configure(EntityTypeBuilder<PaymentRecord> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.UserId).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Status).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.Method).HasConversion<string>().HasMaxLength(50);
        builder.Property(p => p.GatewayTransactionId).HasMaxLength(200);
        builder.Property(p => p.FailureReason).HasMaxLength(500);
        builder.Property(p => p.ErrorCode).HasMaxLength(50);
        builder.Property(p => p.RowVersion).IsRowVersion();

        builder.OwnsOne(p => p.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("Currency").HasMaxLength(3);
        });

        builder.HasMany(p => p.Transactions)
            .WithOne()
            .HasForeignKey(t => t.PaymentRecordId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(p => p.DomainEvents);

        builder.HasIndex(p => p.BookingId);
        builder.HasIndex(p => p.UserId);
    }
}

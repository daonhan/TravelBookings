using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TravelBooking.Infrastructure.Saga;

public class BookingSagaStateMap : SagaClassMap<BookingSagaState>
{
    protected override void Configure(EntityTypeBuilder<BookingSagaState> entity, ModelBuilder model)
    {
        entity.ToTable("BookingSagaState");

        entity.Property(x => x.CurrentState).HasMaxLength(64);
        entity.Property(x => x.UserId).HasMaxLength(100);
        entity.Property(x => x.Currency).HasMaxLength(3);
        entity.Property(x => x.Destination).HasMaxLength(200);
        entity.Property(x => x.PaymentReference).HasMaxLength(200);
        entity.Property(x => x.Amount).HasPrecision(18, 2);
        entity.Property(x => x.RowVersion).IsRowVersion();
    }
}

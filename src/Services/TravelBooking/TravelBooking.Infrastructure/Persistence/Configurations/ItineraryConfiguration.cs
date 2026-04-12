using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelBooking.Domain.Entities;

namespace TravelBooking.Infrastructure.Persistence.Configurations;

public class ItineraryConfiguration : IEntityTypeConfiguration<Itinerary>
{
    public void Configure(EntityTypeBuilder<Itinerary> builder)
    {
        builder.HasKey(i => i.Id);

        builder.OwnsOne(i => i.Details, details =>
        {
            details.Property(d => d.Origin).HasColumnName("Origin").HasMaxLength(100);
            details.Property(d => d.Destination).HasColumnName("Destination").HasMaxLength(100);
            details.Property(d => d.TravelClass).HasColumnName("TravelClass").HasMaxLength(50);
            details.Property(d => d.NumberOfTravelers).HasColumnName("NumberOfTravelers");
        });
    }
}

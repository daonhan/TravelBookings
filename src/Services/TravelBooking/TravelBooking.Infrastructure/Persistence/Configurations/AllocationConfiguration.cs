using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelBooking.Domain.Entities;

namespace TravelBooking.Infrastructure.Persistence.Configurations;

public class AllocationConfiguration : IEntityTypeConfiguration<Allocation>
{
    public void Configure(EntityTypeBuilder<Allocation> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.ResourceType).HasMaxLength(100);
        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(50);
    }
}

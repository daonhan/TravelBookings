using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reporting.Domain.ReadModels;

namespace Reporting.Infrastructure.Persistence.Configurations;

public class EventSummaryConfiguration : IEntityTypeConfiguration<EventSummary>
{
    public void Configure(EntityTypeBuilder<EventSummary> builder)
    {
        builder.ToTable("EventSummaries");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Location).HasMaxLength(500);
        builder.Property(e => e.Status).HasMaxLength(50);

        builder.HasIndex(e => e.EventId).IsUnique();
        builder.HasIndex(e => e.StartDate);
    }
}

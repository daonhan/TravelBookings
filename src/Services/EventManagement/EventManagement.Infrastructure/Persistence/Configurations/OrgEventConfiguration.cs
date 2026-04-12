using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EventManagement.Domain.Entities;

namespace EventManagement.Infrastructure.Persistence.Configurations;

public class OrgEventConfiguration : IEntityTypeConfiguration<OrgEvent>
{
    public void Configure(EntityTypeBuilder<OrgEvent> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.OrganizerId).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Status).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(e => e.Categories).HasMaxLength(500);
        builder.Property(e => e.RowVersion).IsRowVersion();

        builder.OwnsOne(e => e.Location, address =>
        {
            address.Property(a => a.Venue).HasColumnName("Venue").HasMaxLength(200);
            address.Property(a => a.Street).HasColumnName("Street").HasMaxLength(200);
            address.Property(a => a.City).HasColumnName("City").HasMaxLength(100);
            address.Property(a => a.State).HasColumnName("State").HasMaxLength(100);
            address.Property(a => a.Country).HasColumnName("Country").HasMaxLength(100);
            address.Property(a => a.PostalCode).HasColumnName("PostalCode").HasMaxLength(20);
        });

        builder.OwnsOne(e => e.Schedule, dateRange =>
        {
            dateRange.Property(d => d.StartDate).HasColumnName("StartDate");
            dateRange.Property(d => d.EndDate).HasColumnName("EndDate");
        });

        builder.HasMany(e => e.Sessions)
            .WithOne()
            .HasForeignKey(s => s.OrgEventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Registrations)
            .WithOne()
            .HasForeignKey(r => r.OrgEventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(e => e.DomainEvents);

        builder.HasIndex(e => e.OrganizerId);
        builder.HasIndex(e => e.Status);
    }
}

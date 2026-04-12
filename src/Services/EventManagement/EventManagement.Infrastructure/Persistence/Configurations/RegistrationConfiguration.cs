using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EventManagement.Domain.Entities;

namespace EventManagement.Infrastructure.Persistence.Configurations;

public class RegistrationConfiguration : IEntityTypeConfiguration<Registration>
{
    public void Configure(EntityTypeBuilder<Registration> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.UserId).IsRequired().HasMaxLength(100);
        builder.Property(r => r.AttendeeName).IsRequired().HasMaxLength(200);
        builder.Property(r => r.RegistrationType).HasConversion<string>().HasMaxLength(50);
        builder.Property(r => r.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(r => r.SessionPreferences).HasMaxLength(1000);

        builder.HasIndex(r => r.UserId);
    }
}

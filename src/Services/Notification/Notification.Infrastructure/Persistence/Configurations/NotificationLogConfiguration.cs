using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Notification.Domain.Entities;

namespace Notification.Infrastructure.Persistence.Configurations;

public class NotificationLogConfiguration : IEntityTypeConfiguration<NotificationLog>
{
    public void Configure(EntityTypeBuilder<NotificationLog> builder)
    {
        builder.ToTable("Notifications");
        builder.HasKey(n => n.Id);

        builder.Property(n => n.UserId).IsRequired().HasMaxLength(100);
        builder.Property(n => n.Type).HasConversion<string>().HasMaxLength(50);
        builder.Property(n => n.Channel).HasConversion<string>().HasMaxLength(20);
        builder.Property(n => n.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(n => n.Subject).IsRequired().HasMaxLength(500);
        builder.Property(n => n.Body).IsRequired();
        builder.Property(n => n.Recipient).HasMaxLength(500);
        builder.Property(n => n.ErrorMessage).HasMaxLength(2000);
        builder.Property(n => n.RowVersion).IsRowVersion();

        builder.HasIndex(n => n.UserId);
        builder.HasIndex(n => n.ReferenceId);
        builder.HasIndex(n => n.CreatedAt);

        builder.Ignore(n => n.DomainEvents);
    }
}

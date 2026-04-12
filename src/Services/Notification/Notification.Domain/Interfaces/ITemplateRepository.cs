using Notification.Domain.Entities;

namespace Notification.Domain.Interfaces;

public interface ITemplateRepository
{
    Task<NotificationTemplate?> GetByTypeAndChannelAsync(
        Enums.NotificationType type,
        Enums.NotificationChannel channel,
        CancellationToken ct = default);
}

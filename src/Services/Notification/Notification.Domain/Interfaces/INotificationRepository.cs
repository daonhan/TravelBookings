using Notification.Domain.Entities;

namespace Notification.Domain.Interfaces;

public interface INotificationRepository
{
    Task<NotificationLog?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<NotificationLog>> GetByUserIdAsync(string userId, int page, int pageSize, CancellationToken ct = default);
    Task<int> GetCountByUserIdAsync(string userId, CancellationToken ct = default);
    Task AddAsync(NotificationLog notification, CancellationToken ct = default);
}

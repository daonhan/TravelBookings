using Microsoft.EntityFrameworkCore;
using Notification.Domain.Entities;
using Notification.Domain.Interfaces;

namespace Notification.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly Persistence.NotificationDbContext _context;

    public NotificationRepository(Persistence.NotificationDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationLog?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id, ct);
    }

    public async Task<IReadOnlyList<NotificationLog>> GetByUserIdAsync(string userId, int page, int pageSize, CancellationToken ct)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> GetCountByUserIdAsync(string userId, CancellationToken ct)
    {
        return await _context.Notifications.CountAsync(n => n.UserId == userId, ct);
    }

    public async Task AddAsync(NotificationLog notification, CancellationToken ct)
    {
        await _context.Notifications.AddAsync(notification, ct);
    }
}

using Microsoft.EntityFrameworkCore;
using Notification.Domain.Entities;
using Notification.Domain.Enums;
using Notification.Domain.Interfaces;

namespace Notification.Infrastructure.Repositories;

public class TemplateRepository : ITemplateRepository
{
    private readonly Persistence.NotificationDbContext _context;

    public TemplateRepository(Persistence.NotificationDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationTemplate?> GetByTypeAndChannelAsync(
        NotificationType type,
        NotificationChannel channel,
        CancellationToken ct)
    {
        return await _context.Templates
            .FirstOrDefaultAsync(t => t.Type == type && t.Channel == channel && t.IsActive, ct);
    }
}

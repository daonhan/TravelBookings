using Microsoft.EntityFrameworkCore;
using Notification.Domain.Entities;
using Notification.Domain.Interfaces;

namespace Notification.Infrastructure.Repositories;

public class UserPreferenceRepository : IUserPreferenceRepository
{
    private readonly Persistence.NotificationDbContext _context;

    public UserPreferenceRepository(Persistence.NotificationDbContext context)
    {
        _context = context;
    }

    public async Task<UserPreference?> GetByUserIdAsync(string userId, CancellationToken ct)
    {
        return await _context.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId, ct);
    }

    public async Task AddAsync(UserPreference preference, CancellationToken ct)
    {
        await _context.UserPreferences.AddAsync(preference, ct);
    }

    public Task UpdateAsync(UserPreference preference, CancellationToken ct)
    {
        _context.UserPreferences.Update(preference);
        return Task.CompletedTask;
    }
}

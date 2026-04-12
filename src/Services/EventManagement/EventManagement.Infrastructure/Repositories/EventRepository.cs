using Microsoft.EntityFrameworkCore;
using EventManagement.Domain.Entities;
using EventManagement.Domain.Interfaces;
using EventManagement.Infrastructure.Persistence;

namespace EventManagement.Infrastructure.Repositories;

public class EventRepository : IEventRepository
{
    private readonly EventManagementDbContext _context;

    public EventRepository(EventManagementDbContext context)
    {
        _context = context;
    }

    public async Task<OrgEvent?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Events
            .Include(e => e.Sessions)
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.Id == id, ct);
    }

    public async Task<List<OrgEvent>> SearchAsync(
        string? organizerId, string? title, string? location,
        DateTime? fromDate, DateTime? toDate,
        int page, int pageSize, CancellationToken ct = default)
    {
        var query = BuildSearchQuery(organizerId, title, location, fromDate, toDate);

        return await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(
        string? organizerId, string? title, string? location,
        DateTime? fromDate, DateTime? toDate,
        CancellationToken ct = default)
    {
        return await BuildSearchQuery(organizerId, title, location, fromDate, toDate).CountAsync(ct);
    }

    public async Task AddAsync(OrgEvent orgEvent, CancellationToken ct = default)
    {
        await _context.Events.AddAsync(orgEvent, ct);
    }

    public Task UpdateAsync(OrgEvent orgEvent, CancellationToken ct = default)
    {
        _context.Events.Update(orgEvent);
        return Task.CompletedTask;
    }

    private IQueryable<OrgEvent> BuildSearchQuery(
        string? organizerId, string? title, string? location,
        DateTime? fromDate, DateTime? toDate)
    {
        IQueryable<OrgEvent> query = _context.Events;

        if (!string.IsNullOrEmpty(organizerId))
            query = query.Where(e => e.OrganizerId == organizerId);

        if (!string.IsNullOrEmpty(title))
            query = query.Where(e => e.Title.Contains(title));

        if (!string.IsNullOrEmpty(location))
            query = query.Where(e => e.Location.City.Contains(location) || e.Location.Country.Contains(location));

        if (fromDate.HasValue)
            query = query.Where(e => e.Schedule.StartDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(e => e.Schedule.EndDate <= toDate.Value);

        return query;
    }
}

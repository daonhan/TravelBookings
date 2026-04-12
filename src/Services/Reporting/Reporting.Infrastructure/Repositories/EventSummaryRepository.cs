using Microsoft.EntityFrameworkCore;
using Reporting.Domain.Interfaces;
using Reporting.Domain.ReadModels;
using Reporting.Infrastructure.Persistence;

namespace Reporting.Infrastructure.Repositories;

public class EventSummaryRepository : IEventSummaryRepository
{
    private readonly ReportingDbContext _context;

    public EventSummaryRepository(ReportingDbContext context)
    {
        _context = context;
    }

    public async Task<EventSummary?> GetByEventIdAsync(Guid eventId, CancellationToken ct)
    {
        return await _context.EventSummaries.FirstOrDefaultAsync(e => e.EventId == eventId, ct);
    }

    public async Task<IReadOnlyList<EventSummary>> GetAllAsync(int page, int pageSize, CancellationToken ct)
    {
        return await _context.EventSummaries
            .OrderByDescending(e => e.StartDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> GetTotalCountAsync(CancellationToken ct)
    {
        return await _context.EventSummaries.CountAsync(ct);
    }

    public async Task AddAsync(EventSummary summary, CancellationToken ct)
    {
        await _context.EventSummaries.AddAsync(summary, ct);
    }

    public Task UpdateAsync(EventSummary summary, CancellationToken ct)
    {
        _context.EventSummaries.Update(summary);
        return Task.CompletedTask;
    }
}

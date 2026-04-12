using Microsoft.EntityFrameworkCore;
using Reporting.Domain.Interfaces;
using Reporting.Domain.ReadModels;
using Reporting.Infrastructure.Persistence;

namespace Reporting.Infrastructure.Repositories;

public class BookingSummaryRepository : IBookingSummaryRepository
{
    private readonly ReportingDbContext _context;

    public BookingSummaryRepository(ReportingDbContext context)
    {
        _context = context;
    }

    public async Task<BookingSummary?> GetByBookingIdAsync(Guid bookingId, CancellationToken ct)
    {
        return await _context.BookingSummaries.FirstOrDefaultAsync(b => b.BookingId == bookingId, ct);
    }

    public async Task<IReadOnlyList<BookingSummary>> GetAllAsync(int page, int pageSize, CancellationToken ct)
    {
        return await _context.BookingSummaries
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> GetTotalCountAsync(CancellationToken ct)
    {
        return await _context.BookingSummaries.CountAsync(ct);
    }

    public async Task AddAsync(BookingSummary summary, CancellationToken ct)
    {
        await _context.BookingSummaries.AddAsync(summary, ct);
    }

    public Task UpdateAsync(BookingSummary summary, CancellationToken ct)
    {
        _context.BookingSummaries.Update(summary);
        return Task.CompletedTask;
    }
}

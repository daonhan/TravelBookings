using Microsoft.EntityFrameworkCore;
using Reporting.Domain.Interfaces;
using Reporting.Domain.ReadModels;
using Reporting.Infrastructure.Persistence;

namespace Reporting.Infrastructure.Repositories;

public class RevenueRepository : IRevenueRepository
{
    private readonly ReportingDbContext _context;

    public RevenueRepository(ReportingDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<RevenueRecord>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken ct)
    {
        return await _context.RevenueRecords
            .Where(r => r.ProcessedAt >= from && r.ProcessedAt <= to)
            .OrderByDescending(r => r.ProcessedAt)
            .ToListAsync(ct);
    }

    public async Task<decimal> GetTotalRevenueAsync(DateTime from, DateTime to, CancellationToken ct)
    {
        return await _context.RevenueRecords
            .Where(r => r.ProcessedAt >= from && r.ProcessedAt <= to && r.Status == "completed")
            .SumAsync(r => r.Amount, ct);
    }

    public async Task AddAsync(RevenueRecord record, CancellationToken ct)
    {
        await _context.RevenueRecords.AddAsync(record, ct);
    }
}

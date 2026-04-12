using Reporting.Domain.ReadModels;

namespace Reporting.Domain.Interfaces;

public interface IRevenueRepository
{
    Task<IReadOnlyList<RevenueRecord>> GetByDateRangeAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<decimal> GetTotalRevenueAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task AddAsync(RevenueRecord record, CancellationToken ct = default);
}

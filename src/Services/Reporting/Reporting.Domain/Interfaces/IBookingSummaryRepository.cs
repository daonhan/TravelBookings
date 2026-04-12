using Reporting.Domain.ReadModels;

namespace Reporting.Domain.Interfaces;

public interface IBookingSummaryRepository
{
    Task<BookingSummary?> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default);
    Task<IReadOnlyList<BookingSummary>> GetAllAsync(int page, int pageSize, CancellationToken ct = default);
    Task<int> GetTotalCountAsync(CancellationToken ct = default);
    Task AddAsync(BookingSummary summary, CancellationToken ct = default);
    Task UpdateAsync(BookingSummary summary, CancellationToken ct = default);
}

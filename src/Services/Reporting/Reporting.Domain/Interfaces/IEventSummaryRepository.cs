using Reporting.Domain.ReadModels;

namespace Reporting.Domain.Interfaces;

public interface IEventSummaryRepository
{
    Task<EventSummary?> GetByEventIdAsync(Guid eventId, CancellationToken ct = default);
    Task<IReadOnlyList<EventSummary>> GetAllAsync(int page, int pageSize, CancellationToken ct = default);
    Task<int> GetTotalCountAsync(CancellationToken ct = default);
    Task AddAsync(EventSummary summary, CancellationToken ct = default);
    Task UpdateAsync(EventSummary summary, CancellationToken ct = default);
}

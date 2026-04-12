using EventManagement.Domain.Entities;

namespace EventManagement.Domain.Interfaces;

public interface IEventRepository
{
    Task<OrgEvent?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<OrgEvent>> SearchAsync(string? organizerId, string? title, string? location, DateTime? fromDate, DateTime? toDate, int page, int pageSize, CancellationToken ct = default);
    Task<int> CountAsync(string? organizerId, string? title, string? location, DateTime? fromDate, DateTime? toDate, CancellationToken ct = default);
    Task AddAsync(OrgEvent orgEvent, CancellationToken ct = default);
    Task UpdateAsync(OrgEvent orgEvent, CancellationToken ct = default);
}

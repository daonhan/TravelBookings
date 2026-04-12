namespace Reporting.Application.DTOs;

public record EventSummaryDto
{
    public Guid EventId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int Capacity { get; init; }
    public int RegisteredCount { get; init; }
    public string Status { get; init; } = string.Empty;
}

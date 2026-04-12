namespace Reporting.Application.DTOs;

public record DashboardDto
{
    public int TotalBookings { get; init; }
    public int TotalEvents { get; init; }
    public decimal TotalRevenue { get; init; }
    public string Currency { get; init; } = "USD";
    public IReadOnlyList<BookingSummaryDto> RecentBookings { get; init; } = [];
    public IReadOnlyList<EventSummaryDto> UpcomingEvents { get; init; } = [];
}

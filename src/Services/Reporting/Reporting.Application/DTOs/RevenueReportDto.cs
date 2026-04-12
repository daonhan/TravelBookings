namespace Reporting.Application.DTOs;

public record RevenueReportDto
{
    public DateTime FromDate { get; init; }
    public DateTime ToDate { get; init; }
    public decimal TotalRevenue { get; init; }
    public string Currency { get; init; } = "USD";
    public int TransactionCount { get; init; }
    public IReadOnlyList<RevenueItemDto> Items { get; init; } = [];
}

public record RevenueItemDto
{
    public Guid PaymentId { get; init; }
    public Guid BookingId { get; init; }
    public decimal Amount { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime ProcessedAt { get; init; }
}

namespace Reporting.Application.DTOs;

public record BookingSummaryDto
{
    public Guid BookingId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string Destination { get; init; } = string.Empty;
    public DateTime TravelDate { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "USD";
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? CancelledAt { get; init; }
}

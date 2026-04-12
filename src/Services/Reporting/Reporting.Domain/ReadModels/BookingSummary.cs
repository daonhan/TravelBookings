namespace Reporting.Domain.ReadModels;

/// <summary>
/// Denormalized read model projected from BookingConfirmed/BookingCancelled events.
/// </summary>
public class BookingSummary
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime TravelDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
}

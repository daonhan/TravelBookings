namespace TravelBookings.Common.Events.Contracts;

public record BookingCancelledEvent : IntegrationEvent
{
    public Guid BookingId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public decimal CancellationFee { get; init; }
    public decimal RefundAmount { get; init; }
    public string Currency { get; init; } = "USD";
    public string OriginalPaymentId { get; init; } = string.Empty;

    public BookingCancelledEvent() : base("BookingCancelled")
    {
        Source = "travel-booking-service";
    }
}

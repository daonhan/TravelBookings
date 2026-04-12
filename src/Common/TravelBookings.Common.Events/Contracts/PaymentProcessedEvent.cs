namespace TravelBookings.Common.Events.Contracts;

public record PaymentProcessedEvent : IntegrationEvent
{
    public Guid PaymentId { get; init; }
    public Guid BookingId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
    public string Method { get; init; } = string.Empty;
    public string Status { get; init; } = "completed";
    public string GatewayTransactionId { get; init; } = string.Empty;
    public DateTime ProcessedAt { get; init; } = DateTime.UtcNow;

    public PaymentProcessedEvent() : base("PaymentProcessed")
    {
        Source = "payment-service";
    }
}

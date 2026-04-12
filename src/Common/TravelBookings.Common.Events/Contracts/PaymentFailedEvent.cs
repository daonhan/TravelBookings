namespace TravelBookings.Common.Events.Contracts;

public record PaymentFailedEvent : IntegrationEvent
{
    public Guid PaymentId { get; init; }
    public Guid BookingId { get; init; }
    public string Reason { get; init; } = string.Empty;
    public string ErrorCode { get; init; } = string.Empty;

    public PaymentFailedEvent() : base("PaymentFailed")
    {
        Source = "payment-service";
    }
}

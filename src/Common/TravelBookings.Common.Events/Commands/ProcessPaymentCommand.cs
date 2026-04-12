namespace TravelBookings.Common.Events.Commands;

public record ProcessPaymentCommand
{
    public Guid CorrelationId { get; init; }
    public Guid BookingId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
    public string PaymentMethod { get; init; } = "credit_card";
}

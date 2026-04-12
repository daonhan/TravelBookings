namespace TravelBookings.Common.Events.Contracts;

public record BookingConfirmedEvent : IntegrationEvent
{
    public Guid BookingId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string TravelType { get; init; } = string.Empty;
    public string Origin { get; init; } = string.Empty;
    public string Destination { get; init; } = string.Empty;
    public DateTime DepartureDate { get; init; }
    public DateTime? ReturnDate { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "USD";
    public int PassengerCount { get; init; }
    public string PaymentReference { get; init; } = string.Empty;

    public BookingConfirmedEvent() : base("BookingConfirmed")
    {
        Source = "travel-booking-service";
    }
}

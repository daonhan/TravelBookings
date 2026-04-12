namespace TravelBookings.Common.Events.Commands;

public record ReserveInventoryCommand
{
    public Guid CorrelationId { get; init; }
    public Guid BookingId { get; init; }
    public string Destination { get; init; } = string.Empty;
    public DateTime DepartureDate { get; init; }
    public DateTime? ReturnDate { get; init; }
    public int PassengerCount { get; init; }
    public string TravelClass { get; init; } = "economy";
}

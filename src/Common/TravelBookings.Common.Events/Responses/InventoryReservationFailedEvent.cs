namespace TravelBookings.Common.Events.Responses;

public record InventoryReservationFailedEvent
{
    public Guid CorrelationId { get; init; }
    public Guid BookingId { get; init; }
    public string Reason { get; init; } = string.Empty;
}

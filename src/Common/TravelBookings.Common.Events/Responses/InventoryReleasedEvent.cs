namespace TravelBookings.Common.Events.Responses;

public record InventoryReleasedEvent
{
    public Guid CorrelationId { get; init; }
    public Guid BookingId { get; init; }
}

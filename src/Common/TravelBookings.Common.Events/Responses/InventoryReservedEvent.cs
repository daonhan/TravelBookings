namespace TravelBookings.Common.Events.Responses;

public record InventoryReservedEvent
{
    public Guid CorrelationId { get; init; }
    public Guid BookingId { get; init; }
    public Guid AllocationId { get; init; }
    public DateTime ReservedUntil { get; init; }
}

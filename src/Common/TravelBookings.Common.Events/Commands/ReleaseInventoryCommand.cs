namespace TravelBookings.Common.Events.Commands;

public record ReleaseInventoryCommand
{
    public Guid CorrelationId { get; init; }
    public Guid BookingId { get; init; }
    public Guid AllocationId { get; init; }
    public string Reason { get; init; } = string.Empty;
}

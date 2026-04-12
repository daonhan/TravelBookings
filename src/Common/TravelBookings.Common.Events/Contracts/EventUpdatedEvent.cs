namespace TravelBookings.Common.Events.Contracts;

public record EventUpdatedEvent : IntegrationEvent
{
    public Guid OrgEventId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int Capacity { get; init; }
    public string Status { get; init; } = string.Empty;
    public List<string> ChangedFields { get; init; } = [];

    public EventUpdatedEvent() : base("EventUpdated")
    {
        Source = "event-management-service";
    }
}

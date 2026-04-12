namespace TravelBookings.Common.Events.Contracts;

public record EventCreatedEvent : IntegrationEvent
{
    public Guid OrgEventId { get; init; }
    public string OrganizerId { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int Capacity { get; init; }
    public string Status { get; init; } = "draft";
    public List<string> Categories { get; init; } = [];

    public EventCreatedEvent() : base("EventCreated")
    {
        Source = "event-management-service";
    }
}

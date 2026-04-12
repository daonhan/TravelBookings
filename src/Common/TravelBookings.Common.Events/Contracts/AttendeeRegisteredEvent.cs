namespace TravelBookings.Common.Events.Contracts;

public record AttendeeRegisteredEvent : IntegrationEvent
{
    public Guid RegistrationId { get; init; }
    public Guid OrgEventId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string AttendeeName { get; init; } = string.Empty;
    public string RegistrationType { get; init; } = "in-person";
    public List<string> SessionPreferences { get; init; } = [];

    public AttendeeRegisteredEvent() : base("AttendeeRegistered")
    {
        Source = "event-management-service";
    }
}

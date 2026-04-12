namespace TravelBookings.Common.Events;

public abstract record IntegrationEvent
{
    public Guid EventId { get; init; } = Guid.NewGuid();
    public string EventType { get; init; }
    public int EventVersion { get; init; } = 1;
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public string CorrelationId { get; init; } = string.Empty;
    public string Source { get; init; } = string.Empty;

    protected IntegrationEvent(string eventType)
    {
        EventType = eventType;
    }
}

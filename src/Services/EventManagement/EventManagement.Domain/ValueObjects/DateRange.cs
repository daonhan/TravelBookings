namespace EventManagement.Domain.ValueObjects;

public record DateRange
{
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }

    public bool Overlaps(DateRange other)
    {
        return StartDate < other.EndDate && other.StartDate < EndDate;
    }

    public TimeSpan Duration => EndDate - StartDate;
}

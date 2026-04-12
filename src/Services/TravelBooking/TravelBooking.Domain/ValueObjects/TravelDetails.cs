namespace TravelBooking.Domain.ValueObjects;

public record TravelDetails
{
    public string Origin { get; init; } = string.Empty;
    public string Destination { get; init; } = string.Empty;
    public string TravelClass { get; init; } = "economy";
    public int NumberOfTravelers { get; init; } = 1;
}

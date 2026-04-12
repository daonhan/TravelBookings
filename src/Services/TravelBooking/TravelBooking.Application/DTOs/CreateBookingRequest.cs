namespace TravelBooking.Application.DTOs;

public record CreateBookingRequest
{
    public string UserId { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "USD";
    public List<CreateItineraryRequest> Itineraries { get; init; } = [];
    public List<CreatePassengerRequest> Passengers { get; init; } = [];
}

public record CreateItineraryRequest
{
    public string Origin { get; init; } = string.Empty;
    public string Destination { get; init; } = string.Empty;
    public string TravelClass { get; init; } = "economy";
    public DateTime DepartureDate { get; init; }
    public DateTime? ReturnDate { get; init; }
}

public record CreatePassengerRequest
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string PassportNumber { get; init; } = string.Empty;
    public DateTime DateOfBirth { get; init; }
}

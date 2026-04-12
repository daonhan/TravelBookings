namespace TravelBooking.Application.DTOs;

public record BookingDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "USD";
    public string PaymentReference { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? ConfirmedAt { get; init; }
    public List<ItineraryDto> Itineraries { get; init; } = [];
    public List<PassengerDto> Passengers { get; init; } = [];
}

public record ItineraryDto
{
    public Guid Id { get; init; }
    public string Origin { get; init; } = string.Empty;
    public string Destination { get; init; } = string.Empty;
    public string TravelClass { get; init; } = string.Empty;
    public DateTime DepartureDate { get; init; }
    public DateTime? ReturnDate { get; init; }
}

public record PassengerDto
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public DateTime DateOfBirth { get; init; }
}

public record PagedResult<T>
{
    public List<T> Items { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

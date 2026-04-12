using TravelBooking.Domain.ValueObjects;

namespace TravelBooking.Domain.Entities;

public class Itinerary
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public TravelDetails Details { get; set; } = new();
    public DateTime DepartureDate { get; set; }
    public DateTime? ReturnDate { get; set; }
}

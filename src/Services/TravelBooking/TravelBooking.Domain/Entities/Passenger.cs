namespace TravelBooking.Domain.Entities;

public class Passenger
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PassportNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
}

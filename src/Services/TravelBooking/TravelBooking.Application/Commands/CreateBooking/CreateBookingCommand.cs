using MediatR;
using TravelBooking.Application.DTOs;

namespace TravelBooking.Application.Commands.CreateBooking;

public record CreateBookingCommand : IRequest<BookingDto>
{
    public string UserId { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = "USD";
    public List<CreateItineraryRequest> Itineraries { get; init; } = [];
    public List<CreatePassengerRequest> Passengers { get; init; } = [];
}

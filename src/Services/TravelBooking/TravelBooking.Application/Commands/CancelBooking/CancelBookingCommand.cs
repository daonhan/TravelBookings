using MediatR;

namespace TravelBooking.Application.Commands.CancelBooking;

public record CancelBookingCommand(Guid BookingId, string Reason) : IRequest<bool>;

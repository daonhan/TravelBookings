using MediatR;
using TravelBooking.Application.DTOs;

namespace TravelBooking.Application.Queries.GetBooking;

public record GetBookingQuery(Guid BookingId) : IRequest<BookingDto?>;

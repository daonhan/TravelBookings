using MediatR;
using TravelBooking.Application.DTOs;
using TravelBooking.Domain.Entities;
using TravelBooking.Domain.Interfaces;

namespace TravelBooking.Application.Queries.GetBooking;

public class GetBookingQueryHandler : IRequestHandler<GetBookingQuery, BookingDto?>
{
    private readonly IBookingRepository _repository;

    public GetBookingQueryHandler(IBookingRepository repository)
    {
        _repository = repository;
    }

    public async Task<BookingDto?> Handle(GetBookingQuery request, CancellationToken cancellationToken)
    {
        var booking = await _repository.GetByIdAsync(request.BookingId, cancellationToken);
        if (booking is null) return null;

        return new BookingDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            Status = booking.Status.ToString(),
            TotalAmount = booking.TotalAmount.Amount,
            Currency = booking.TotalAmount.Currency,
            PaymentReference = booking.PaymentReference,
            CreatedAt = booking.CreatedAt,
            ConfirmedAt = booking.ConfirmedAt,
            Itineraries = booking.Itineraries.Select(i => new ItineraryDto
            {
                Id = i.Id,
                Origin = i.Details.Origin,
                Destination = i.Details.Destination,
                TravelClass = i.Details.TravelClass,
                DepartureDate = i.DepartureDate,
                ReturnDate = i.ReturnDate
            }).ToList(),
            Passengers = booking.Passengers.Select(p => new PassengerDto
            {
                Id = p.Id,
                FirstName = p.FirstName,
                LastName = p.LastName,
                DateOfBirth = p.DateOfBirth
            }).ToList()
        };
    }
}

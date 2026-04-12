using MediatR;
using TravelBooking.Application.DTOs;
using TravelBooking.Domain.Entities;
using TravelBooking.Domain.Interfaces;
using TravelBooking.Domain.ValueObjects;

namespace TravelBooking.Application.Commands.CreateBooking;

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, BookingDto>
{
    private readonly IBookingRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBookingCommandHandler(IBookingRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<BookingDto> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var totalAmount = new Money { Amount = request.TotalAmount, Currency = request.Currency };
        var booking = Booking.Create(request.UserId, totalAmount);

        foreach (var itinerary in request.Itineraries)
        {
            booking.AddItinerary(
                itinerary.Origin,
                itinerary.Destination,
                itinerary.DepartureDate,
                itinerary.ReturnDate,
                itinerary.TravelClass);
        }

        foreach (var passenger in request.Passengers)
        {
            booking.AddPassenger(
                passenger.FirstName,
                passenger.LastName,
                passenger.PassportNumber,
                passenger.DateOfBirth);
        }

        await _repository.AddAsync(booking, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(booking);
    }

    private static BookingDto MapToDto(Booking booking) => new()
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

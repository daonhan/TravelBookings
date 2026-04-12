using MediatR;
using TravelBooking.Domain.Enums;
using TravelBooking.Domain.Events;
using TravelBooking.Domain.ValueObjects;

namespace TravelBooking.Domain.Entities;

public class Booking
{
    private readonly List<Itinerary> _itineraries = [];
    private readonly List<Passenger> _passengers = [];
    private readonly List<INotification> _domainEvents = [];

    public Guid Id { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public BookingStatus Status { get; private set; }
    public Money TotalAmount { get; private set; } = Money.Zero();
    public string PaymentReference { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    public DateTime? ConfirmedAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    public IReadOnlyCollection<Itinerary> Itineraries => _itineraries.AsReadOnly();
    public IReadOnlyCollection<Passenger> Passengers => _passengers.AsReadOnly();
    public IReadOnlyCollection<INotification> DomainEvents => _domainEvents.AsReadOnly();

    private Booking() { } // EF Core

    public static Booking Create(string userId, Money totalAmount)
    {
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = BookingStatus.Requested,
            TotalAmount = totalAmount,
            CreatedAt = DateTime.UtcNow
        };

        booking._domainEvents.Add(new BookingCreatedDomainEvent(booking.Id, DateTime.UtcNow));
        return booking;
    }

    public void AddItinerary(string origin, string destination, DateTime departureDate, DateTime? returnDate, string travelClass)
    {
        var itinerary = new Itinerary
        {
            Id = Guid.NewGuid(),
            BookingId = Id,
            Details = new TravelDetails
            {
                Origin = origin,
                Destination = destination,
                TravelClass = travelClass
            },
            DepartureDate = departureDate,
            ReturnDate = returnDate
        };
        _itineraries.Add(itinerary);
    }

    public void AddPassenger(string firstName, string lastName, string passportNumber, DateTime dateOfBirth)
    {
        var passenger = new Passenger
        {
            Id = Guid.NewGuid(),
            BookingId = Id,
            FirstName = firstName,
            LastName = lastName,
            PassportNumber = passportNumber,
            DateOfBirth = dateOfBirth
        };
        _passengers.Add(passenger);
    }

    public void Confirm(string paymentReference)
    {
        if (Status != BookingStatus.PaymentProcessing && Status != BookingStatus.InventoryReserved)
            throw new InvalidOperationException($"Cannot confirm booking in {Status} state");

        Status = BookingStatus.Confirmed;
        PaymentReference = paymentReference;
        ConfirmedAt = DateTime.UtcNow;

        _domainEvents.Add(new BookingConfirmedDomainEvent(Id, DateTime.UtcNow));
    }

    public void Cancel(string reason)
    {
        if (Status == BookingStatus.Cancelled || Status == BookingStatus.Failed)
            throw new InvalidOperationException($"Cannot cancel booking in {Status} state");

        Status = BookingStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;

        _domainEvents.Add(new BookingCancelledDomainEvent(Id, reason, DateTime.UtcNow));
    }

    public void MarkInventoryReserved() => Status = BookingStatus.InventoryReserved;
    public void MarkPaymentProcessing() => Status = BookingStatus.PaymentProcessing;
    public void MarkFailed() => Status = BookingStatus.Failed;
    public void MarkCompensating() => Status = BookingStatus.Compensating;

    public void ClearDomainEvents() => _domainEvents.Clear();
}

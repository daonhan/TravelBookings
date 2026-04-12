using MediatR;

namespace TravelBooking.Domain.Events;

public record BookingConfirmedDomainEvent(Guid BookingId, DateTime OccurredOn) : INotification;

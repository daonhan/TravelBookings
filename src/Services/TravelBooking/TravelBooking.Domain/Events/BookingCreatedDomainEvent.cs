using MediatR;

namespace TravelBooking.Domain.Events;

public record BookingCreatedDomainEvent(Guid BookingId, DateTime OccurredOn) : INotification;

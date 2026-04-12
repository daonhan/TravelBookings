using MediatR;

namespace TravelBooking.Domain.Events;

public record BookingCancelledDomainEvent(Guid BookingId, string Reason, DateTime OccurredOn) : INotification;

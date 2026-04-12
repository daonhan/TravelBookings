using MediatR;

namespace Payment.Domain.Events;

public record PaymentCompletedDomainEvent(Guid PaymentId, Guid BookingId, DateTime OccurredOn) : INotification;

using MediatR;

namespace Payment.Domain.Events;

public record PaymentFailedDomainEvent(Guid PaymentId, Guid BookingId, string Reason, DateTime OccurredOn) : INotification;

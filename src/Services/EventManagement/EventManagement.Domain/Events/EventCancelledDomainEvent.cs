using MediatR;

namespace EventManagement.Domain.Events;

public record EventCancelledDomainEvent(Guid EventId, string Reason, DateTime OccurredOn) : INotification;

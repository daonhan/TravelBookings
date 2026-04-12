using MediatR;

namespace EventManagement.Domain.Events;

public record EventCreatedDomainEvent(Guid EventId, DateTime OccurredOn) : INotification;

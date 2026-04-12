using MediatR;

namespace EventManagement.Domain.Events;

public record AttendeeRegisteredDomainEvent(Guid RegistrationId, Guid EventId, string UserId, DateTime OccurredOn) : INotification;

using MediatR;

namespace EventManagement.Application.Commands.CancelEvent;

public record CancelEventCommand(Guid EventId, string Reason) : IRequest<bool>;

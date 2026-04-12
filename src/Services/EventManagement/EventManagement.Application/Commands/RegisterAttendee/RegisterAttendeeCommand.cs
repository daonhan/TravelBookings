using MediatR;
using EventManagement.Application.DTOs;

namespace EventManagement.Application.Commands.RegisterAttendee;

public record RegisterAttendeeCommand : IRequest<RegistrationDto>
{
    public Guid EventId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string AttendeeName { get; init; } = string.Empty;
    public string RegistrationType { get; init; } = "Standard";
    public string? SessionPreferences { get; init; }
}

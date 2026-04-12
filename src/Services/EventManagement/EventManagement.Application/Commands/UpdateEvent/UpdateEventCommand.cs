using MediatR;
using EventManagement.Application.DTOs;

namespace EventManagement.Application.Commands.UpdateEvent;

public record UpdateEventCommand : IRequest<EventDto>
{
    public Guid EventId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Venue { get; init; } = string.Empty;
    public string Street { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int Capacity { get; init; }
    public string Categories { get; init; } = string.Empty;
}

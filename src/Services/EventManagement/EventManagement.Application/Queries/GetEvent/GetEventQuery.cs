using MediatR;
using EventManagement.Application.DTOs;

namespace EventManagement.Application.Queries.GetEvent;

public record GetEventQuery(Guid EventId) : IRequest<EventDto?>;

using MediatR;
using EventManagement.Application.DTOs;

namespace EventManagement.Application.Queries.SearchEvents;

public record SearchEventsQuery : IRequest<PagedResult<EventDto>>
{
    public string? OrganizerId { get; init; }
    public string? Title { get; init; }
    public string? Location { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

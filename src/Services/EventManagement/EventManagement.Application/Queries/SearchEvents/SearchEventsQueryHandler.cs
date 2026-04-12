using MediatR;
using EventManagement.Application.DTOs;
using EventManagement.Domain.Interfaces;

namespace EventManagement.Application.Queries.SearchEvents;

public class SearchEventsQueryHandler : IRequestHandler<SearchEventsQuery, PagedResult<EventDto>>
{
    private readonly IEventRepository _repository;

    public SearchEventsQueryHandler(IEventRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<EventDto>> Handle(SearchEventsQuery request, CancellationToken cancellationToken)
    {
        var events = await _repository.SearchAsync(
            request.OrganizerId, request.Title, request.Location,
            request.FromDate, request.ToDate,
            request.Page, request.PageSize, cancellationToken);

        int totalCount = await _repository.CountAsync(
            request.OrganizerId, request.Title, request.Location,
            request.FromDate, request.ToDate, cancellationToken);

        return new PagedResult<EventDto>
        {
            Items = events.Select(e => new EventDto
            {
                Id = e.Id,
                OrganizerId = e.OrganizerId,
                Title = e.Title,
                Description = e.Description,
                Venue = e.Location.Venue,
                City = e.Location.City,
                Country = e.Location.Country,
                StartDate = e.Schedule.StartDate,
                EndDate = e.Schedule.EndDate,
                Capacity = e.Capacity,
                AvailableCapacity = e.AvailableCapacity,
                Status = e.Status.ToString(),
                Categories = e.Categories,
                CreatedAt = e.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}

using MediatR;
using EventManagement.Application.DTOs;
using EventManagement.Domain.Interfaces;

namespace EventManagement.Application.Queries.GetEvent;

public class GetEventQueryHandler : IRequestHandler<GetEventQuery, EventDto?>
{
    private readonly IEventRepository _repository;

    public GetEventQueryHandler(IEventRepository repository)
    {
        _repository = repository;
    }

    public async Task<EventDto?> Handle(GetEventQuery request, CancellationToken cancellationToken)
    {
        var orgEvent = await _repository.GetByIdAsync(request.EventId, cancellationToken);
        if (orgEvent is null) return null;

        return new EventDto
        {
            Id = orgEvent.Id,
            OrganizerId = orgEvent.OrganizerId,
            Title = orgEvent.Title,
            Description = orgEvent.Description,
            Venue = orgEvent.Location.Venue,
            City = orgEvent.Location.City,
            Country = orgEvent.Location.Country,
            StartDate = orgEvent.Schedule.StartDate,
            EndDate = orgEvent.Schedule.EndDate,
            Capacity = orgEvent.Capacity,
            AvailableCapacity = orgEvent.AvailableCapacity,
            Status = orgEvent.Status.ToString(),
            Categories = orgEvent.Categories,
            CreatedAt = orgEvent.CreatedAt,
            Sessions = orgEvent.Sessions.Select(s => new SessionDto
            {
                Id = s.Id,
                Title = s.Title,
                Speaker = s.Speaker,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Capacity = s.Capacity
            }).ToList(),
            Registrations = orgEvent.Registrations.Select(r => new RegistrationDto
            {
                Id = r.Id,
                UserId = r.UserId,
                AttendeeName = r.AttendeeName,
                RegistrationType = r.RegistrationType.ToString(),
                Status = r.Status.ToString(),
                RegisteredAt = r.RegisteredAt
            }).ToList()
        };
    }
}

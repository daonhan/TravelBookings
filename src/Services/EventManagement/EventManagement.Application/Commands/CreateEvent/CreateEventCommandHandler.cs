using MediatR;
using EventManagement.Application.DTOs;
using EventManagement.Domain.Entities;
using EventManagement.Domain.Interfaces;
using EventManagement.Domain.ValueObjects;

namespace EventManagement.Application.Commands.CreateEvent;

public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, EventDto>
{
    private readonly IEventRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateEventCommandHandler(IEventRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<EventDto> Handle(CreateEventCommand request, CancellationToken cancellationToken)
    {
        var location = new Address
        {
            Venue = request.Venue,
            Street = request.Street,
            City = request.City,
            State = request.State,
            Country = request.Country,
            PostalCode = request.PostalCode
        };

        var schedule = new DateRange
        {
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        var orgEvent = OrgEvent.Create(
            request.OrganizerId,
            request.Title,
            request.Description,
            location,
            schedule,
            request.Capacity,
            request.Categories);

        foreach (var session in request.Sessions)
        {
            orgEvent.AddSession(
                session.Title,
                session.Description,
                session.Speaker,
                session.StartTime,
                session.EndTime,
                session.Capacity);
        }

        await _repository.AddAsync(orgEvent, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(orgEvent);
    }

    private static EventDto MapToDto(OrgEvent orgEvent) => new()
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
        }).ToList()
    };
}

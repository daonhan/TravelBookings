using MediatR;
using EventManagement.Application.DTOs;
using EventManagement.Domain.Interfaces;
using EventManagement.Domain.ValueObjects;

namespace EventManagement.Application.Commands.UpdateEvent;

public class UpdateEventCommandHandler : IRequestHandler<UpdateEventCommand, EventDto>
{
    private readonly IEventRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateEventCommandHandler(IEventRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<EventDto> Handle(UpdateEventCommand request, CancellationToken cancellationToken)
    {
        var orgEvent = await _repository.GetByIdAsync(request.EventId, cancellationToken)
            ?? throw new KeyNotFoundException($"Event {request.EventId} not found");

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

        orgEvent.Update(request.Title, request.Description, location, schedule, request.Capacity, request.Categories);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
            CreatedAt = orgEvent.CreatedAt
        };
    }
}

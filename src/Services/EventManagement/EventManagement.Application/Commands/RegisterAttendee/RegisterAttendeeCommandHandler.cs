using MediatR;
using EventManagement.Application.DTOs;
using EventManagement.Domain.Enums;
using EventManagement.Domain.Interfaces;

namespace EventManagement.Application.Commands.RegisterAttendee;

public class RegisterAttendeeCommandHandler : IRequestHandler<RegisterAttendeeCommand, RegistrationDto>
{
    private readonly IEventRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterAttendeeCommandHandler(IEventRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<RegistrationDto> Handle(RegisterAttendeeCommand request, CancellationToken cancellationToken)
    {
        var orgEvent = await _repository.GetByIdAsync(request.EventId, cancellationToken)
            ?? throw new KeyNotFoundException($"Event {request.EventId} not found");

        var registrationType = Enum.Parse<RegistrationType>(request.RegistrationType, ignoreCase: true);

        var registration = orgEvent.RegisterAttendee(
            request.UserId,
            request.AttendeeName,
            registrationType,
            request.SessionPreferences);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RegistrationDto
        {
            Id = registration.Id,
            UserId = registration.UserId,
            AttendeeName = registration.AttendeeName,
            RegistrationType = registration.RegistrationType.ToString(),
            Status = registration.Status.ToString(),
            RegisteredAt = registration.RegisteredAt
        };
    }
}

using MediatR;
using Notification.Application.DTOs;
using Notification.Domain.Entities;
using Notification.Domain.Interfaces;

namespace Notification.Application.Commands.UpdateUserPreference;

public class UpdateUserPreferenceCommandHandler : IRequestHandler<UpdateUserPreferenceCommand, UserPreferenceDto>
{
    private readonly IUserPreferenceRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserPreferenceCommandHandler(IUserPreferenceRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserPreferenceDto> Handle(UpdateUserPreferenceCommand request, CancellationToken ct)
    {
        var existing = await _repository.GetByUserIdAsync(request.UserId, ct);

        if (existing is null)
        {
            existing = UserPreference.Create(
                request.UserId,
                request.PreferredChannel,
                request.Email,
                request.PhoneNumber);
            await _repository.AddAsync(existing, ct);
        }
        else
        {
            existing.UpdatePreferences(
                request.PreferredChannel,
                request.EmailEnabled,
                request.SmsEnabled,
                request.PushEnabled);
            existing.UpdateContactInfo(request.Email, request.PhoneNumber);
            await _repository.UpdateAsync(existing, ct);
        }

        await _unitOfWork.SaveChangesAsync(ct);

        return new UserPreferenceDto
        {
            Id = existing.Id,
            UserId = existing.UserId,
            PreferredChannel = existing.PreferredChannel.ToString(),
            EmailEnabled = existing.EmailEnabled,
            SmsEnabled = existing.SmsEnabled,
            PushEnabled = existing.PushEnabled,
            Email = existing.Email,
            PhoneNumber = existing.PhoneNumber
        };
    }
}

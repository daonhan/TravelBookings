using MediatR;
using Notification.Application.DTOs;
using Notification.Domain.Interfaces;

namespace Notification.Application.Queries.GetUserPreference;

public class GetUserPreferenceQueryHandler : IRequestHandler<GetUserPreferenceQuery, UserPreferenceDto?>
{
    private readonly IUserPreferenceRepository _repository;

    public GetUserPreferenceQueryHandler(IUserPreferenceRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserPreferenceDto?> Handle(GetUserPreferenceQuery request, CancellationToken ct)
    {
        var preference = await _repository.GetByUserIdAsync(request.UserId, ct);
        if (preference is null) return null;

        return new UserPreferenceDto
        {
            Id = preference.Id,
            UserId = preference.UserId,
            PreferredChannel = preference.PreferredChannel.ToString(),
            EmailEnabled = preference.EmailEnabled,
            SmsEnabled = preference.SmsEnabled,
            PushEnabled = preference.PushEnabled,
            Email = preference.Email,
            PhoneNumber = preference.PhoneNumber
        };
    }
}

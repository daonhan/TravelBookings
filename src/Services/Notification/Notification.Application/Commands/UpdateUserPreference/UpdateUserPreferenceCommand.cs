using MediatR;
using Notification.Application.DTOs;
using Notification.Domain.Enums;

namespace Notification.Application.Commands.UpdateUserPreference;

public record UpdateUserPreferenceCommand : IRequest<UserPreferenceDto>
{
    public string UserId { get; init; } = string.Empty;
    public NotificationChannel PreferredChannel { get; init; }
    public bool EmailEnabled { get; init; }
    public bool SmsEnabled { get; init; }
    public bool PushEnabled { get; init; }
    public string? Email { get; init; }
    public string? PhoneNumber { get; init; }
}

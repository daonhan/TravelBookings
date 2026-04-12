namespace Notification.Application.DTOs;

public record UserPreferenceDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string PreferredChannel { get; init; } = string.Empty;
    public bool EmailEnabled { get; init; }
    public bool SmsEnabled { get; init; }
    public bool PushEnabled { get; init; }
    public string? Email { get; init; }
    public string? PhoneNumber { get; init; }
}

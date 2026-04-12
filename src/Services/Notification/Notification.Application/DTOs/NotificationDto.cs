using Notification.Domain.Enums;

namespace Notification.Application.DTOs;

public record NotificationDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Channel { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string Subject { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
    public string? Recipient { get; init; }
    public string? ErrorMessage { get; init; }
    public Guid? ReferenceId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? SentAt { get; init; }
}

using MediatR;
using Notification.Domain.Enums;

namespace Notification.Domain.Entities;

public class NotificationLog
{
    public Guid Id { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public NotificationType Type { get; private set; }
    public NotificationChannel Channel { get; private set; }
    public NotificationStatus Status { get; private set; }
    public string Subject { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public string? Recipient { get; private set; }
    public string? ErrorMessage { get; private set; }
    public Guid? ReferenceId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? SentAt { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    private readonly List<INotification> _domainEvents = [];
    public IReadOnlyCollection<INotification> DomainEvents => _domainEvents.AsReadOnly();
    public void ClearDomainEvents() => _domainEvents.Clear();

    private NotificationLog() { }

    public static NotificationLog Create(
        string userId,
        NotificationType type,
        NotificationChannel channel,
        string subject,
        string body,
        string? recipient = null,
        Guid? referenceId = null)
    {
        return new NotificationLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Channel = channel,
            Status = NotificationStatus.Pending,
            Subject = subject,
            Body = body,
            Recipient = recipient,
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void MarkSent()
    {
        Status = NotificationStatus.Sent;
        SentAt = DateTime.UtcNow;
    }

    public void MarkDelivered()
    {
        Status = NotificationStatus.Delivered;
    }

    public void MarkFailed(string errorMessage)
    {
        Status = NotificationStatus.Failed;
        ErrorMessage = errorMessage;
    }
}

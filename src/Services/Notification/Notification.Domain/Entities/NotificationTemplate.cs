using Notification.Domain.Enums;

namespace Notification.Domain.Entities;

public class NotificationTemplate
{
    public Guid Id { get; private set; }
    public NotificationType Type { get; private set; }
    public NotificationChannel Channel { get; private set; }
    public string SubjectTemplate { get; private set; } = string.Empty;
    public string BodyTemplate { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private NotificationTemplate() { }

    public static NotificationTemplate Create(
        NotificationType type,
        NotificationChannel channel,
        string subjectTemplate,
        string bodyTemplate)
    {
        return new NotificationTemplate
        {
            Id = Guid.NewGuid(),
            Type = type,
            Channel = channel,
            SubjectTemplate = subjectTemplate,
            BodyTemplate = bodyTemplate,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Update(string subjectTemplate, string bodyTemplate)
    {
        SubjectTemplate = subjectTemplate;
        BodyTemplate = bodyTemplate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}

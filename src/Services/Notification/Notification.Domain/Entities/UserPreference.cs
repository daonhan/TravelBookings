using Notification.Domain.Enums;

namespace Notification.Domain.Entities;

public class UserPreference
{
    public Guid Id { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public NotificationChannel PreferredChannel { get; private set; }
    public bool EmailEnabled { get; private set; }
    public bool SmsEnabled { get; private set; }
    public bool PushEnabled { get; private set; }
    public string? Email { get; private set; }
    public string? PhoneNumber { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private UserPreference() { }

    public static UserPreference Create(
        string userId,
        NotificationChannel preferredChannel,
        string? email = null,
        string? phoneNumber = null)
    {
        return new UserPreference
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PreferredChannel = preferredChannel,
            EmailEnabled = true,
            SmsEnabled = true,
            PushEnabled = true,
            Email = email,
            PhoneNumber = phoneNumber,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdatePreferences(
        NotificationChannel preferredChannel,
        bool emailEnabled,
        bool smsEnabled,
        bool pushEnabled)
    {
        PreferredChannel = preferredChannel;
        EmailEnabled = emailEnabled;
        SmsEnabled = smsEnabled;
        PushEnabled = pushEnabled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateContactInfo(string? email, string? phoneNumber)
    {
        Email = email;
        PhoneNumber = phoneNumber;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsChannelEnabled(NotificationChannel channel)
    {
        return channel switch
        {
            NotificationChannel.Email => EmailEnabled,
            NotificationChannel.Sms => SmsEnabled,
            NotificationChannel.Push => PushEnabled,
            _ => false
        };
    }
}

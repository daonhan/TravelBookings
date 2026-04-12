using FluentAssertions;
using Notification.Domain.Entities;
using Notification.Domain.Enums;

namespace Notification.Tests.Domain;

public class UserPreferenceTests
{
    [Fact]
    public void Create_ShouldEnableAllChannelsByDefault()
    {
        var pref = UserPreference.Create("user-1", NotificationChannel.Email, "user@test.com");

        pref.EmailEnabled.Should().BeTrue();
        pref.SmsEnabled.Should().BeTrue();
        pref.PushEnabled.Should().BeTrue();
        pref.PreferredChannel.Should().Be(NotificationChannel.Email);
    }

    [Fact]
    public void UpdatePreferences_ShouldChangeValues()
    {
        var pref = UserPreference.Create("user-1", NotificationChannel.Email);

        pref.UpdatePreferences(NotificationChannel.Sms, true, true, false);

        pref.PreferredChannel.Should().Be(NotificationChannel.Sms);
        pref.PushEnabled.Should().BeFalse();
    }

    [Fact]
    public void IsChannelEnabled_ShouldReflectPreferences()
    {
        var pref = UserPreference.Create("user-1", NotificationChannel.Email);
        pref.UpdatePreferences(NotificationChannel.Email, true, false, true);

        pref.IsChannelEnabled(NotificationChannel.Email).Should().BeTrue();
        pref.IsChannelEnabled(NotificationChannel.Sms).Should().BeFalse();
        pref.IsChannelEnabled(NotificationChannel.Push).Should().BeTrue();
    }
}

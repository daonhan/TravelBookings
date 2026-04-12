using FluentAssertions;
using Notification.Domain.Entities;
using Notification.Domain.Enums;

namespace Notification.Tests.Domain;

public class NotificationLogTests
{
    [Fact]
    public void Create_ShouldSetPendingStatus()
    {
        var notification = NotificationLog.Create(
            "user-1", NotificationType.BookingConfirmation,
            NotificationChannel.Email, "Subject", "Body");

        notification.Status.Should().Be(NotificationStatus.Pending);
        notification.UserId.Should().Be("user-1");
        notification.SentAt.Should().BeNull();
    }

    [Fact]
    public void MarkSent_ShouldUpdateStatusAndTimestamp()
    {
        var notification = NotificationLog.Create(
            "user-1", NotificationType.BookingConfirmation,
            NotificationChannel.Email, "Subject", "Body");

        notification.MarkSent();

        notification.Status.Should().Be(NotificationStatus.Sent);
        notification.SentAt.Should().NotBeNull();
    }

    [Fact]
    public void MarkDelivered_ShouldUpdateStatus()
    {
        var notification = NotificationLog.Create(
            "user-1", NotificationType.BookingConfirmation,
            NotificationChannel.Email, "Subject", "Body");
        notification.MarkSent();

        notification.MarkDelivered();

        notification.Status.Should().Be(NotificationStatus.Delivered);
    }

    [Fact]
    public void MarkFailed_ShouldUpdateStatusAndSetError()
    {
        var notification = NotificationLog.Create(
            "user-1", NotificationType.BookingConfirmation,
            NotificationChannel.Email, "Subject", "Body");

        notification.MarkFailed("SMTP connection failed");

        notification.Status.Should().Be(NotificationStatus.Failed);
        notification.ErrorMessage.Should().Be("SMTP connection failed");
    }

    [Fact]
    public void Create_WithReferenceId_ShouldSetReferenceId()
    {
        var refId = Guid.NewGuid();
        var notification = NotificationLog.Create(
            "user-1", NotificationType.PaymentReceipt,
            NotificationChannel.Email, "Payment", "Body",
            referenceId: refId);

        notification.ReferenceId.Should().Be(refId);
        notification.Type.Should().Be(NotificationType.PaymentReceipt);
    }
}

using FluentAssertions;
using Reporting.Domain.ReadModels;

namespace Reporting.Tests.Domain;

public class ReadModelTests
{
    [Fact]
    public void BookingSummary_ShouldInitializeCorrectly()
    {
        var summary = new BookingSummary
        {
            Id = Guid.NewGuid(),
            BookingId = Guid.NewGuid(),
            UserId = "user-1",
            Destination = "Paris",
            TravelDate = DateTime.UtcNow.AddDays(30),
            TotalAmount = 1500,
            Currency = "USD",
            Status = "Confirmed",
            CreatedAt = DateTime.UtcNow
        };

        summary.UserId.Should().Be("user-1");
        summary.Destination.Should().Be("Paris");
        summary.TotalAmount.Should().Be(1500);
        summary.Status.Should().Be("Confirmed");
        summary.CancelledAt.Should().BeNull();
    }

    [Fact]
    public void EventSummary_ShouldInitializeCorrectly()
    {
        var summary = new EventSummary
        {
            Id = Guid.NewGuid(),
            EventId = Guid.NewGuid(),
            Title = "Tech Conference",
            Location = "Sydney",
            StartDate = DateTime.UtcNow.AddDays(60),
            EndDate = DateTime.UtcNow.AddDays(62),
            Capacity = 500,
            RegisteredCount = 0,
            Status = "Published",
            CreatedAt = DateTime.UtcNow
        };

        summary.Title.Should().Be("Tech Conference");
        summary.Capacity.Should().Be(500);
        summary.RegisteredCount.Should().Be(0);
    }

    [Fact]
    public void RevenueRecord_ShouldInitializeCorrectly()
    {
        var record = new RevenueRecord
        {
            Id = Guid.NewGuid(),
            PaymentId = Guid.NewGuid(),
            BookingId = Guid.NewGuid(),
            UserId = "user-1",
            Amount = 750,
            Currency = "USD",
            PaymentMethod = "CreditCard",
            Status = "completed",
            ProcessedAt = DateTime.UtcNow
        };

        record.Amount.Should().Be(750);
        record.Status.Should().Be("completed");
    }

    [Fact]
    public void BookingSummary_Cancellation_ShouldUpdateFields()
    {
        var summary = new BookingSummary
        {
            Id = Guid.NewGuid(),
            BookingId = Guid.NewGuid(),
            UserId = "user-1",
            Status = "Confirmed",
            CreatedAt = DateTime.UtcNow
        };

        summary.Status = "Cancelled";
        summary.CancelledAt = DateTime.UtcNow;
        summary.CancellationReason = "User requested";

        summary.Status.Should().Be("Cancelled");
        summary.CancelledAt.Should().NotBeNull();
        summary.CancellationReason.Should().Be("User requested");
    }
}

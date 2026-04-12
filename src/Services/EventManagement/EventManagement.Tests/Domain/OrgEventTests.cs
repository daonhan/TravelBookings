using FluentAssertions;
using EventManagement.Domain.Entities;
using EventManagement.Domain.Enums;
using EventManagement.Domain.ValueObjects;

namespace EventManagement.Tests.Domain;

public class OrgEventTests
{
    private static OrgEvent CreateTestEvent(int capacity = 100) =>
        OrgEvent.Create(
            "organizer-1",
            "Tech Conference 2026",
            "Annual tech conference",
            new Address { Venue = "Convention Center", City = "Seattle", Country = "US" },
            new DateRange { StartDate = DateTime.UtcNow.AddDays(30), EndDate = DateTime.UtcNow.AddDays(32) },
            capacity,
            "Technology,Conference");

    [Fact]
    public void Create_ShouldSetDraftStatus()
    {
        var orgEvent = CreateTestEvent();

        orgEvent.Status.Should().Be(EventStatus.Draft);
        orgEvent.OrganizerId.Should().Be("organizer-1");
        orgEvent.Title.Should().Be("Tech Conference 2026");
        orgEvent.DomainEvents.Should().ContainSingle();
    }

    [Fact]
    public void Publish_ShouldTransitionToPublished()
    {
        var orgEvent = CreateTestEvent();

        orgEvent.Publish();

        orgEvent.Status.Should().Be(EventStatus.Published);
    }

    [Fact]
    public void Publish_WhenNotDraft_ShouldThrow()
    {
        var orgEvent = CreateTestEvent();
        orgEvent.Publish();

        var act = () => orgEvent.Publish();

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Cancel_ShouldTransitionToCancelled()
    {
        var orgEvent = CreateTestEvent();

        orgEvent.Cancel("budget cuts");

        orgEvent.Status.Should().Be(EventStatus.Cancelled);
        orgEvent.CancelledAt.Should().NotBeNull();
    }

    [Fact]
    public void Cancel_WhenAlreadyCancelled_ShouldThrow()
    {
        var orgEvent = CreateTestEvent();
        orgEvent.Cancel("first cancel");

        var act = () => orgEvent.Cancel("second cancel");

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void AddSession_ShouldAddToCollection()
    {
        var orgEvent = CreateTestEvent();

        orgEvent.AddSession("Keynote", "Opening keynote", "John Doe",
            DateTime.UtcNow.AddDays(30), DateTime.UtcNow.AddDays(30).AddHours(2), 500);

        orgEvent.Sessions.Should().ContainSingle();
        orgEvent.Sessions.First().Title.Should().Be("Keynote");
    }

    [Fact]
    public void RegisterAttendee_ShouldAddRegistration()
    {
        var orgEvent = CreateTestEvent();
        orgEvent.Publish();

        var registration = orgEvent.RegisterAttendee("user-1", "Jane Doe", RegistrationType.Standard);

        orgEvent.Registrations.Should().ContainSingle();
        registration.UserId.Should().Be("user-1");
        registration.Status.Should().Be(RegistrationStatus.Confirmed);
    }

    [Fact]
    public void RegisterAttendee_WhenNotPublished_ShouldThrow()
    {
        var orgEvent = CreateTestEvent();

        var act = () => orgEvent.RegisterAttendee("user-1", "Jane Doe", RegistrationType.Standard);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void RegisterAttendee_WhenAtCapacity_ShouldThrow()
    {
        var orgEvent = CreateTestEvent(capacity: 1);
        orgEvent.Publish();
        orgEvent.RegisterAttendee("user-1", "Jane Doe", RegistrationType.Standard);

        var act = () => orgEvent.RegisterAttendee("user-2", "John Doe", RegistrationType.Standard);

        act.Should().Throw<InvalidOperationException>().WithMessage("*capacity*");
    }

    [Fact]
    public void RegisterAttendee_WhenDuplicate_ShouldThrow()
    {
        var orgEvent = CreateTestEvent();
        orgEvent.Publish();
        orgEvent.RegisterAttendee("user-1", "Jane Doe", RegistrationType.Standard);

        var act = () => orgEvent.RegisterAttendee("user-1", "Jane Doe", RegistrationType.VIP);

        act.Should().Throw<InvalidOperationException>().WithMessage("*already registered*");
    }

    [Fact]
    public void Update_WhenCancelled_ShouldThrow()
    {
        var orgEvent = CreateTestEvent();
        orgEvent.Cancel("cancelled");

        var act = () => orgEvent.Update("New Title", "desc",
            new Address { City = "Portland", Country = "US" },
            new DateRange { StartDate = DateTime.UtcNow.AddDays(40), EndDate = DateTime.UtcNow.AddDays(42) },
            200, "Tech");

        act.Should().Throw<InvalidOperationException>();
    }
}

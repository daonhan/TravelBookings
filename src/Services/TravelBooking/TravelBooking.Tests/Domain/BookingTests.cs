using FluentAssertions;
using TravelBooking.Domain.Entities;
using TravelBooking.Domain.Enums;
using TravelBooking.Domain.ValueObjects;

namespace TravelBooking.Tests.Domain;

public class BookingTests
{
    [Fact]
    public void Create_ShouldSetRequestedStatus()
    {
        var booking = Booking.Create("user-1", new Money { Amount = 1000, Currency = "USD" });

        booking.Status.Should().Be(BookingStatus.Requested);
        booking.UserId.Should().Be("user-1");
        booking.TotalAmount.Amount.Should().Be(1000);
        booking.DomainEvents.Should().ContainSingle();
    }

    [Fact]
    public void Confirm_ShouldTransitionToConfirmed()
    {
        var booking = Booking.Create("user-1", new Money { Amount = 500, Currency = "USD" });
        booking.MarkInventoryReserved();
        booking.MarkPaymentProcessing();

        booking.Confirm("PAY-123");

        booking.Status.Should().Be(BookingStatus.Confirmed);
        booking.PaymentReference.Should().Be("PAY-123");
        booking.ConfirmedAt.Should().NotBeNull();
    }

    [Fact]
    public void Cancel_ShouldTransitionToCancelled()
    {
        var booking = Booking.Create("user-1", new Money { Amount = 500, Currency = "USD" });

        booking.Cancel("schedule change");

        booking.Status.Should().Be(BookingStatus.Cancelled);
        booking.CancelledAt.Should().NotBeNull();
    }

    [Fact]
    public void Cancel_WhenAlreadyCancelled_ShouldThrow()
    {
        var booking = Booking.Create("user-1", new Money { Amount = 500, Currency = "USD" });
        booking.Cancel("first cancel");

        var act = () => booking.Cancel("second cancel");

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void AddItinerary_ShouldAddToCollection()
    {
        var booking = Booking.Create("user-1", new Money { Amount = 500, Currency = "USD" });

        booking.AddItinerary("NYC", "LAX", DateTime.UtcNow.AddDays(30), DateTime.UtcNow.AddDays(37), "economy");

        booking.Itineraries.Should().ContainSingle();
        booking.Itineraries.First().Details.Origin.Should().Be("NYC");
    }

    [Fact]
    public void AddPassenger_ShouldAddToCollection()
    {
        var booking = Booking.Create("user-1", new Money { Amount = 500, Currency = "USD" });

        booking.AddPassenger("John", "Doe", "XX123456", new DateTime(1990, 1, 1));

        booking.Passengers.Should().ContainSingle();
        booking.Passengers.First().FirstName.Should().Be("John");
    }
}

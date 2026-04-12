using FluentAssertions;
using FluentValidation.TestHelper;
using TravelBooking.Application.Commands.CreateBooking;
using TravelBooking.Application.DTOs;

namespace TravelBooking.Tests.Application;

public class CreateBookingCommandValidatorTests
{
    private readonly CreateBookingCommandValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        var command = new CreateBookingCommand
        {
            UserId = "user-1",
            TotalAmount = 1000,
            Currency = "USD",
            Itineraries = [new CreateItineraryRequest
            {
                Origin = "NYC",
                Destination = "LAX",
                DepartureDate = DateTime.UtcNow.AddDays(30)
            }],
            Passengers = [new CreatePassengerRequest
            {
                FirstName = "John",
                LastName = "Doe"
            }]
        };

        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyUserId_ShouldFail()
    {
        var command = new CreateBookingCommand { UserId = "", TotalAmount = 100 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.UserId);
    }

    [Fact]
    public void Validate_NegativeAmount_ShouldFail()
    {
        var command = new CreateBookingCommand { UserId = "user-1", TotalAmount = -100 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.TotalAmount);
    }

    [Fact]
    public void Validate_EmptyItineraries_ShouldFail()
    {
        var command = new CreateBookingCommand { UserId = "user-1", TotalAmount = 100, Itineraries = [] };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Itineraries);
    }
}

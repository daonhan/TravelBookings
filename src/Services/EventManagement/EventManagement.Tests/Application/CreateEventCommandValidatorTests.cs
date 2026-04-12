using FluentAssertions;
using FluentValidation.TestHelper;
using EventManagement.Application.Commands.CreateEvent;

namespace EventManagement.Tests.Application;

public class CreateEventCommandValidatorTests
{
    private readonly CreateEventCommandValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        var command = new CreateEventCommand
        {
            OrganizerId = "organizer-1",
            Title = "Tech Conference",
            City = "Seattle",
            Country = "US",
            StartDate = DateTime.UtcNow.AddDays(30),
            EndDate = DateTime.UtcNow.AddDays(32),
            Capacity = 100
        };

        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyOrganizerId_ShouldFail()
    {
        var command = new CreateEventCommand { OrganizerId = "", Title = "Test", Capacity = 100 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.OrganizerId);
    }

    [Fact]
    public void Validate_EmptyTitle_ShouldFail()
    {
        var command = new CreateEventCommand { OrganizerId = "org-1", Title = "", Capacity = 100 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Validate_ZeroCapacity_ShouldFail()
    {
        var command = new CreateEventCommand { OrganizerId = "org-1", Title = "Test", Capacity = 0 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Capacity);
    }

    [Fact]
    public void Validate_EndDateBeforeStartDate_ShouldFail()
    {
        var command = new CreateEventCommand
        {
            OrganizerId = "org-1",
            Title = "Test",
            City = "Seattle",
            Country = "US",
            StartDate = DateTime.UtcNow.AddDays(30),
            EndDate = DateTime.UtcNow.AddDays(29),
            Capacity = 100
        };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.EndDate);
    }
}

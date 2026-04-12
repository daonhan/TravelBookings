using FluentValidation;

namespace EventManagement.Application.Commands.CreateEvent;

public class CreateEventCommandValidator : AbstractValidator<CreateEventCommand>
{
    public CreateEventCommandValidator()
    {
        RuleFor(x => x.OrganizerId).NotEmpty().WithMessage("OrganizerId is required");
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200).WithMessage("Title is required and must be under 200 characters");
        RuleFor(x => x.City).NotEmpty().WithMessage("City is required");
        RuleFor(x => x.Country).NotEmpty().WithMessage("Country is required");
        RuleFor(x => x.StartDate).GreaterThan(DateTime.UtcNow).WithMessage("StartDate must be in the future");
        RuleFor(x => x.EndDate).GreaterThan(x => x.StartDate).WithMessage("EndDate must be after StartDate");
        RuleFor(x => x.Capacity).GreaterThan(0).WithMessage("Capacity must be positive");

        RuleForEach(x => x.Sessions).ChildRules(session =>
        {
            session.RuleFor(s => s.Title).NotEmpty();
            session.RuleFor(s => s.StartTime).GreaterThan(DateTime.UtcNow);
            session.RuleFor(s => s.EndTime).GreaterThan(s => s.StartTime);
        });
    }
}

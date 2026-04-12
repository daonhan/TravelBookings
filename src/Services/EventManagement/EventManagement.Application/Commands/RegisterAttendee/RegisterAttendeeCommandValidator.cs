using FluentValidation;

namespace EventManagement.Application.Commands.RegisterAttendee;

public class RegisterAttendeeCommandValidator : AbstractValidator<RegisterAttendeeCommand>
{
    public RegisterAttendeeCommandValidator()
    {
        RuleFor(x => x.EventId).NotEmpty().WithMessage("EventId is required");
        RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId is required");
        RuleFor(x => x.AttendeeName).NotEmpty().MaximumLength(200).WithMessage("AttendeeName is required");
        RuleFor(x => x.RegistrationType)
            .Must(rt => Enum.TryParse<Domain.Enums.RegistrationType>(rt, true, out _))
            .WithMessage("Invalid RegistrationType");
    }
}

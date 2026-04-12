using FluentValidation;

namespace TravelBooking.Application.Commands.CreateBooking;

public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId is required");
        RuleFor(x => x.TotalAmount).GreaterThan(0).WithMessage("TotalAmount must be positive");
        RuleFor(x => x.Currency).NotEmpty().Length(3).WithMessage("Currency must be a 3-letter code");
        RuleFor(x => x.Itineraries).NotEmpty().WithMessage("At least one itinerary is required");
        RuleFor(x => x.Passengers).NotEmpty().WithMessage("At least one passenger is required");

        RuleForEach(x => x.Itineraries).ChildRules(itinerary =>
        {
            itinerary.RuleFor(i => i.Origin).NotEmpty();
            itinerary.RuleFor(i => i.Destination).NotEmpty();
            itinerary.RuleFor(i => i.DepartureDate).GreaterThan(DateTime.UtcNow);
        });

        RuleForEach(x => x.Passengers).ChildRules(passenger =>
        {
            passenger.RuleFor(p => p.FirstName).NotEmpty();
            passenger.RuleFor(p => p.LastName).NotEmpty();
        });
    }
}

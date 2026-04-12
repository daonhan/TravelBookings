using FluentValidation;

namespace Payment.Application.Commands.RefundPayment;

public class RefundPaymentCommandValidator : AbstractValidator<RefundPaymentCommand>
{
    public RefundPaymentCommandValidator()
    {
        RuleFor(x => x.PaymentId).NotEmpty().WithMessage("PaymentId is required");
        RuleFor(x => x.RefundAmount).GreaterThan(0).WithMessage("RefundAmount must be positive");
    }
}

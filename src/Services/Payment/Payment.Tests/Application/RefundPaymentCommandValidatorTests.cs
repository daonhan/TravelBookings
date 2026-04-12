using FluentAssertions;
using FluentValidation.TestHelper;
using Payment.Application.Commands.RefundPayment;

namespace Payment.Tests.Application;

public class RefundPaymentCommandValidatorTests
{
    private readonly RefundPaymentCommandValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        var command = new RefundPaymentCommand
        {
            PaymentId = Guid.NewGuid(),
            RefundAmount = 100
        };

        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyPaymentId_ShouldFail()
    {
        var command = new RefundPaymentCommand { PaymentId = Guid.Empty, RefundAmount = 100 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.PaymentId);
    }

    [Fact]
    public void Validate_ZeroAmount_ShouldFail()
    {
        var command = new RefundPaymentCommand { PaymentId = Guid.NewGuid(), RefundAmount = 0 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.RefundAmount);
    }
}

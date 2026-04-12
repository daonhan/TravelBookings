using FluentAssertions;
using Payment.Domain.Entities;
using Payment.Domain.Enums;
using Payment.Domain.ValueObjects;

namespace Payment.Tests.Domain;

public class PaymentRecordTests
{
    [Fact]
    public void Create_ShouldSetPendingStatus()
    {
        var payment = PaymentRecord.Create(Guid.NewGuid(), "user-1",
            new Money { Amount = 500, Currency = "USD" }, PaymentMethod.CreditCard);

        payment.Status.Should().Be(PaymentStatus.Pending);
        payment.UserId.Should().Be("user-1");
        payment.Amount.Amount.Should().Be(500);
    }

    [Fact]
    public void Complete_ShouldTransitionToCompleted()
    {
        var payment = PaymentRecord.Create(Guid.NewGuid(), "user-1",
            new Money { Amount = 500, Currency = "USD" }, PaymentMethod.CreditCard);
        payment.MarkProcessing();

        payment.Complete("GW-12345");

        payment.Status.Should().Be(PaymentStatus.Completed);
        payment.GatewayTransactionId.Should().Be("GW-12345");
        payment.ProcessedAt.Should().NotBeNull();
        payment.Transactions.Should().ContainSingle();
    }

    [Fact]
    public void Fail_ShouldTransitionToFailed()
    {
        var payment = PaymentRecord.Create(Guid.NewGuid(), "user-1",
            new Money { Amount = 500, Currency = "USD" }, PaymentMethod.CreditCard);
        payment.MarkProcessing();

        payment.Fail("Insufficient funds", "INSUFFICIENT_FUNDS");

        payment.Status.Should().Be(PaymentStatus.Failed);
        payment.FailureReason.Should().Be("Insufficient funds");
    }

    [Fact]
    public void Refund_ShouldAddTransaction()
    {
        var payment = PaymentRecord.Create(Guid.NewGuid(), "user-1",
            new Money { Amount = 500, Currency = "USD" }, PaymentMethod.CreditCard);
        payment.MarkProcessing();
        payment.Complete("GW-12345");

        payment.Refund(200, "REF-12345");

        payment.Status.Should().Be(PaymentStatus.PartiallyRefunded);
        payment.Transactions.Should().HaveCount(2);
    }

    [Fact]
    public void Refund_FullAmount_ShouldTransitionToRefunded()
    {
        var payment = PaymentRecord.Create(Guid.NewGuid(), "user-1",
            new Money { Amount = 500, Currency = "USD" }, PaymentMethod.CreditCard);
        payment.MarkProcessing();
        payment.Complete("GW-12345");

        payment.Refund(500, "REF-12345");

        payment.Status.Should().Be(PaymentStatus.Refunded);
    }

    [Fact]
    public void Refund_ExceedingAmount_ShouldThrow()
    {
        var payment = PaymentRecord.Create(Guid.NewGuid(), "user-1",
            new Money { Amount = 500, Currency = "USD" }, PaymentMethod.CreditCard);
        payment.MarkProcessing();
        payment.Complete("GW-12345");

        var act = () => payment.Refund(600, "REF-12345");

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Complete_WhenNotProcessing_ShouldThrow()
    {
        var payment = PaymentRecord.Create(Guid.NewGuid(), "user-1",
            new Money { Amount = 500, Currency = "USD" }, PaymentMethod.CreditCard);

        var act = () => payment.Complete("GW-12345");

        act.Should().Throw<InvalidOperationException>();
    }
}

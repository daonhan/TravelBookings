using MediatR;
using Payment.Domain.Enums;
using Payment.Domain.Events;
using Payment.Domain.ValueObjects;

namespace Payment.Domain.Entities;

public class PaymentRecord
{
    private readonly List<PaymentTransaction> _transactions = [];
    private readonly List<INotification> _domainEvents = [];

    public Guid Id { get; private set; }
    public Guid BookingId { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public Money Amount { get; private set; } = Money.Zero();
    public PaymentMethod Method { get; private set; }
    public PaymentStatus Status { get; private set; }
    public string GatewayTransactionId { get; private set; } = string.Empty;
    public string FailureReason { get; private set; } = string.Empty;
    public string ErrorCode { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    public IReadOnlyCollection<PaymentTransaction> Transactions => _transactions.AsReadOnly();
    public IReadOnlyCollection<INotification> DomainEvents => _domainEvents.AsReadOnly();

    private PaymentRecord() { } // EF Core

    public static PaymentRecord Create(Guid bookingId, string userId, Money amount, PaymentMethod method)
    {
        var payment = new PaymentRecord
        {
            Id = Guid.NewGuid(),
            BookingId = bookingId,
            UserId = userId,
            Amount = amount,
            Method = method,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        return payment;
    }

    public void MarkProcessing()
    {
        if (Status != PaymentStatus.Pending)
            throw new InvalidOperationException($"Cannot process payment in {Status} state");

        Status = PaymentStatus.Processing;
    }

    public void Complete(string gatewayTransactionId)
    {
        if (Status != PaymentStatus.Processing)
            throw new InvalidOperationException($"Cannot complete payment in {Status} state");

        Status = PaymentStatus.Completed;
        GatewayTransactionId = gatewayTransactionId;
        ProcessedAt = DateTime.UtcNow;

        _transactions.Add(PaymentTransaction.Create(Id, "CHARGE", Amount.Amount, gatewayTransactionId));
        _domainEvents.Add(new PaymentCompletedDomainEvent(Id, BookingId, DateTime.UtcNow));
    }

    public void Fail(string reason, string errorCode)
    {
        if (Status != PaymentStatus.Processing && Status != PaymentStatus.Pending)
            throw new InvalidOperationException($"Cannot fail payment in {Status} state");

        Status = PaymentStatus.Failed;
        FailureReason = reason;
        ErrorCode = errorCode;
        ProcessedAt = DateTime.UtcNow;

        _domainEvents.Add(new PaymentFailedDomainEvent(Id, BookingId, reason, DateTime.UtcNow));
    }

    public void Refund(decimal refundAmount, string gatewayRefundId)
    {
        if (Status != PaymentStatus.Completed)
            throw new InvalidOperationException($"Cannot refund payment in {Status} state");

        if (refundAmount > Amount.Amount)
            throw new InvalidOperationException("Refund amount exceeds payment amount");

        _transactions.Add(PaymentTransaction.Create(Id, "REFUND", refundAmount, gatewayRefundId));

        decimal totalRefunded = _transactions.Where(t => t.Type == "REFUND").Sum(t => t.Amount);
        Status = totalRefunded >= Amount.Amount ? PaymentStatus.Refunded : PaymentStatus.PartiallyRefunded;
    }

    public void ClearDomainEvents() => _domainEvents.Clear();
}

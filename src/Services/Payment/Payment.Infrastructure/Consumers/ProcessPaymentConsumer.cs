using MassTransit;
using Microsoft.Extensions.Logging;
using Payment.Domain.Entities;
using Payment.Domain.Interfaces;
using Payment.Domain.ValueObjects;
using TravelBookings.Common.Events.Commands;
using TravelBookings.Common.Events.Contracts;

namespace Payment.Infrastructure.Consumers;

/// <summary>
/// Consumes ProcessPaymentCommand from the TravelBooking saga.
/// Simulates payment gateway processing (ACL pattern for Phase 1).
/// </summary>
public class ProcessPaymentConsumer : IConsumer<ProcessPaymentCommand>
{
    private readonly IPaymentRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProcessPaymentConsumer> _logger;

    public ProcessPaymentConsumer(
        IPaymentRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<ProcessPaymentConsumer> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ProcessPaymentCommand> context)
    {
        _logger.LogInformation("Processing payment for booking {BookingId}, Amount: {Amount} {Currency}",
            context.Message.BookingId, context.Message.Amount, context.Message.Currency);

        var amount = new Money { Amount = context.Message.Amount, Currency = context.Message.Currency };
        var method = Enum.TryParse<Domain.Enums.PaymentMethod>(context.Message.PaymentMethod, true, out var parsed)
            ? parsed
            : Domain.Enums.PaymentMethod.CreditCard;

        var payment = PaymentRecord.Create(context.Message.BookingId, context.Message.UserId, amount, method);
        payment.MarkProcessing();

        // Simulate gateway processing delay
        await Task.Delay(200);

        // Simulate success (in production, this calls real payment gateway via ACL)
        string gatewayTransactionId = $"GW-{Guid.NewGuid():N}"[..20];
        payment.Complete(gatewayTransactionId);

        await _repository.AddAsync(payment);
        await _unitOfWork.SaveChangesAsync();

        await context.Publish(new PaymentProcessedEvent
        {
            CorrelationId = context.Message.CorrelationId.ToString(),
            PaymentId = payment.Id,
            BookingId = context.Message.BookingId,
            UserId = context.Message.UserId,
            Amount = context.Message.Amount,
            Currency = context.Message.Currency,
            GatewayTransactionId = gatewayTransactionId,
            ProcessedAt = DateTime.UtcNow
        });

        _logger.LogInformation("Payment completed for booking {BookingId}, PaymentId: {PaymentId}",
            context.Message.BookingId, payment.Id);
    }
}

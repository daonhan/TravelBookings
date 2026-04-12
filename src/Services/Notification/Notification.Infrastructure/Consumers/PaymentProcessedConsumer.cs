using MassTransit;
using Microsoft.Extensions.Logging;
using Notification.Domain.Entities;
using Notification.Domain.Enums;
using Notification.Domain.Interfaces;
using TravelBookings.Common.Events.Contracts;

namespace Notification.Infrastructure.Consumers;

public class PaymentProcessedConsumer : IConsumer<PaymentProcessedEvent>
{
    private readonly INotificationRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PaymentProcessedConsumer> _logger;

    public PaymentProcessedConsumer(
        INotificationRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<PaymentProcessedConsumer> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentProcessedEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Processing payment receipt notification for PaymentId: {PaymentId}", msg.PaymentId);

        var notification = NotificationLog.Create(
            msg.UserId,
            NotificationType.PaymentReceipt,
            NotificationChannel.Email,
            $"Payment Receipt - {msg.PaymentId}",
            $"Payment of {msg.Amount:C} {msg.Currency} has been processed successfully. " +
            $"Transaction ID: {msg.GatewayTransactionId}.",
            referenceId: msg.PaymentId);

        await _repository.AddAsync(notification);
        notification.MarkSent();
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Payment receipt notification sent for PaymentId: {PaymentId}", msg.PaymentId);
    }
}

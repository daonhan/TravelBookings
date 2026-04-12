using MassTransit;
using Microsoft.Extensions.Logging;
using Notification.Domain.Entities;
using Notification.Domain.Enums;
using Notification.Domain.Interfaces;
using TravelBookings.Common.Events.Contracts;

namespace Notification.Infrastructure.Consumers;

public class BookingCancelledConsumer : IConsumer<BookingCancelledEvent>
{
    private readonly INotificationRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BookingCancelledConsumer> _logger;

    public BookingCancelledConsumer(
        INotificationRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<BookingCancelledConsumer> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<BookingCancelledEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Processing booking cancellation notification for BookingId: {BookingId}", msg.BookingId);

        var notification = NotificationLog.Create(
            msg.UserId,
            NotificationType.BookingCancellation,
            NotificationChannel.Email,
            $"Booking Cancelled - {msg.BookingId}",
            $"Your booking {msg.BookingId} has been cancelled. Reason: {msg.Reason}.",
            referenceId: msg.BookingId);

        await _repository.AddAsync(notification);
        notification.MarkSent();
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Booking cancellation notification sent for BookingId: {BookingId}", msg.BookingId);
    }
}

using MassTransit;
using Microsoft.Extensions.Logging;
using Notification.Domain.Entities;
using Notification.Domain.Enums;
using Notification.Domain.Interfaces;
using TravelBookings.Common.Events.Contracts;

namespace Notification.Infrastructure.Consumers;

public class BookingConfirmedConsumer : IConsumer<BookingConfirmedEvent>
{
    private readonly INotificationRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BookingConfirmedConsumer> _logger;

    public BookingConfirmedConsumer(
        INotificationRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<BookingConfirmedConsumer> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<BookingConfirmedEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Processing booking confirmation notification for BookingId: {BookingId}", msg.BookingId);

        var notification = NotificationLog.Create(
            msg.UserId,
            NotificationType.BookingConfirmation,
            NotificationChannel.Email,
            $"Booking Confirmed - {msg.BookingId}",
            $"Your booking has been confirmed. Booking Reference: {msg.BookingId}. " +
            $"Total Amount: {msg.TotalAmount:C}. Departure: {msg.DepartureDate:yyyy-MM-dd}.",
            referenceId: msg.BookingId);

        await _repository.AddAsync(notification);
        notification.MarkSent(); // Stub — real implementation would call email service
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Booking confirmation notification sent for BookingId: {BookingId}", msg.BookingId);
    }
}

using MassTransit;
using Microsoft.Extensions.Logging;
using Notification.Domain.Entities;
using Notification.Domain.Enums;
using Notification.Domain.Interfaces;
using TravelBookings.Common.Events.Contracts;

namespace Notification.Infrastructure.Consumers;

public class AttendeeRegisteredConsumer : IConsumer<AttendeeRegisteredEvent>
{
    private readonly INotificationRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AttendeeRegisteredConsumer> _logger;

    public AttendeeRegisteredConsumer(
        INotificationRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<AttendeeRegisteredConsumer> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<AttendeeRegisteredEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Processing attendee registration notification for EventId: {EventId}", msg.EventId);

        var notification = NotificationLog.Create(
            msg.UserId,
            NotificationType.AttendeeRegistered,
            NotificationChannel.Email,
            $"Registration Confirmed - {msg.OrgEventId}",
            $"You have been registered. Attendee: {msg.AttendeeName}. " +
            $"Registration type: {msg.RegistrationType}.",
            referenceId: msg.OrgEventId);

        await _repository.AddAsync(notification);
        notification.MarkSent();
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Attendee registration notification sent for EventId: {EventId}", msg.EventId);
    }
}

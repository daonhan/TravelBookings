using MediatR;
using Notification.Application.DTOs;
using Notification.Domain.Interfaces;

namespace Notification.Application.Queries.GetNotification;

public class GetNotificationQueryHandler : IRequestHandler<GetNotificationQuery, NotificationDto?>
{
    private readonly INotificationRepository _repository;

    public GetNotificationQueryHandler(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<NotificationDto?> Handle(GetNotificationQuery request, CancellationToken ct)
    {
        var notification = await _repository.GetByIdAsync(request.Id, ct);
        if (notification is null) return null;

        return new NotificationDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            Type = notification.Type.ToString(),
            Channel = notification.Channel.ToString(),
            Status = notification.Status.ToString(),
            Subject = notification.Subject,
            Body = notification.Body,
            Recipient = notification.Recipient,
            ErrorMessage = notification.ErrorMessage,
            ReferenceId = notification.ReferenceId,
            CreatedAt = notification.CreatedAt,
            SentAt = notification.SentAt
        };
    }
}

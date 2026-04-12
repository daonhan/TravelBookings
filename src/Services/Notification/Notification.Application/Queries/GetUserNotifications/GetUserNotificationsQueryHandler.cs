using MediatR;
using Notification.Application.DTOs;
using Notification.Domain.Interfaces;

namespace Notification.Application.Queries.GetUserNotifications;

public class GetUserNotificationsQueryHandler : IRequestHandler<GetUserNotificationsQuery, PagedResult<NotificationDto>>
{
    private readonly INotificationRepository _repository;

    public GetUserNotificationsQueryHandler(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<NotificationDto>> Handle(GetUserNotificationsQuery request, CancellationToken ct)
    {
        var notifications = await _repository.GetByUserIdAsync(request.UserId, request.Page, request.PageSize, ct);
        var totalCount = await _repository.GetCountByUserIdAsync(request.UserId, ct);

        var items = notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            UserId = n.UserId,
            Type = n.Type.ToString(),
            Channel = n.Channel.ToString(),
            Status = n.Status.ToString(),
            Subject = n.Subject,
            Body = n.Body,
            Recipient = n.Recipient,
            ErrorMessage = n.ErrorMessage,
            ReferenceId = n.ReferenceId,
            CreatedAt = n.CreatedAt,
            SentAt = n.SentAt
        }).ToList();

        return new PagedResult<NotificationDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}

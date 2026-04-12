using MediatR;
using Notification.Application.DTOs;

namespace Notification.Application.Queries.GetUserNotifications;

public class GetUserNotificationsQuery : IRequest<PagedResult<NotificationDto>>
{
    public string UserId { get; init; } = string.Empty;
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

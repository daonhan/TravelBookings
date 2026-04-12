using MediatR;
using Notification.Application.DTOs;

namespace Notification.Application.Queries.GetNotification;

public record GetNotificationQuery(Guid Id) : IRequest<NotificationDto?>;

using MediatR;
using Microsoft.AspNetCore.Mvc;
using Notification.Application.Commands.UpdateUserPreference;
using Notification.Application.DTOs;
using Notification.Application.Queries.GetNotification;
using Notification.Application.Queries.GetUserNotifications;
using Notification.Application.Queries.GetUserPreference;

namespace Notification.API.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(NotificationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetNotificationQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("user/{userId}")]
    [ProducesResponseType(typeof(PagedResult<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByUser(
        string userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = new GetUserNotificationsQuery
        {
            UserId = userId,
            Page = page,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    [HttpGet("preferences/{userId}")]
    [ProducesResponseType(typeof(UserPreferenceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPreferences(string userId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetUserPreferenceQuery(userId), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("preferences")]
    [ProducesResponseType(typeof(UserPreferenceDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdatePreferences(
        [FromBody] UpdateUserPreferenceCommand command,
        CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }
}

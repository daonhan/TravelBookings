using MediatR;
using Microsoft.AspNetCore.Mvc;
using EventManagement.Application.Commands.CancelEvent;
using EventManagement.Application.Commands.CreateEvent;
using EventManagement.Application.Commands.RegisterAttendee;
using EventManagement.Application.Commands.UpdateEvent;
using EventManagement.Application.DTOs;
using EventManagement.Application.Queries.GetEvent;
using EventManagement.Application.Queries.SearchEvents;

namespace EventManagement.API.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly IMediator _mediator;

    public EventsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateEventCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetEventQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(EventDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventCommand command, CancellationToken ct)
    {
        var updatedCommand = command with { EventId = id };
        var result = await _mediator.Send(updatedCommand, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(Guid id, [FromQuery] string reason = "Organizer requested", CancellationToken ct = default)
    {
        bool result = await _mediator.Send(new CancelEventCommand(id, reason), ct);
        return result ? NoContent() : NotFound();
    }

    [HttpGet("search")]
    [ProducesResponseType(typeof(PagedResult<EventDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string? organizerId,
        [FromQuery] string? title,
        [FromQuery] string? location,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = new SearchEventsQuery
        {
            OrganizerId = organizerId,
            Title = title,
            Location = location,
            FromDate = fromDate,
            ToDate = toDate,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/registrations")]
    [ProducesResponseType(typeof(RegistrationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RegisterAttendee(Guid id, [FromBody] RegisterAttendeeCommand command, CancellationToken ct)
    {
        var registrationCommand = command with { EventId = id };
        var result = await _mediator.Send(registrationCommand, ct);
        return CreatedAtAction(nameof(GetById), new { id }, result);
    }
}

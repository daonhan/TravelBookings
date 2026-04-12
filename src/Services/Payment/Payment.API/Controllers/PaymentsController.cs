using MediatR;
using Microsoft.AspNetCore.Mvc;
using Payment.Application.Commands.RefundPayment;
using Payment.Application.DTOs;
using Payment.Application.Queries.GetPayment;
using Payment.Application.Queries.GetPaymentsByUser;

namespace Payment.API.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPaymentQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("user/{userId}")]
    [ProducesResponseType(typeof(PagedResult<PaymentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByUser(
        string userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = new GetPaymentsByUserQuery
        {
            UserId = userId,
            Page = page,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/refund")]
    [ProducesResponseType(typeof(PaymentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Refund(Guid id, [FromBody] RefundPaymentCommand command, CancellationToken ct)
    {
        var refundCommand = command with { PaymentId = id };
        var result = await _mediator.Send(refundCommand, ct);
        return Ok(result);
    }
}

using MediatR;
using Microsoft.AspNetCore.Mvc;
using Reporting.Application.DTOs;
using Reporting.Application.Queries.GetBookings;
using Reporting.Application.Queries.GetDashboard;
using Reporting.Application.Queries.GetRevenue;

namespace Reporting.API.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(DashboardDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDashboardQuery(), ct);
        return Ok(result);
    }

    [HttpGet("bookings")]
    [ProducesResponseType(typeof(PagedResult<BookingSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBookings(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = new GetBookingsQuery { Page = page, PageSize = pageSize };
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    [HttpGet("revenue")]
    [ProducesResponseType(typeof(RevenueReportDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRevenue(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct = default)
    {
        var query = new GetRevenueQuery
        {
            FromDate = from ?? DateTime.UtcNow.AddDays(-30),
            ToDate = to ?? DateTime.UtcNow
        };
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }
}

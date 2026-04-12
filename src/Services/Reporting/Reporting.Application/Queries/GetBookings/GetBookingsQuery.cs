using MediatR;
using Reporting.Application.DTOs;

namespace Reporting.Application.Queries.GetBookings;

public class GetBookingsQuery : IRequest<PagedResult<BookingSummaryDto>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

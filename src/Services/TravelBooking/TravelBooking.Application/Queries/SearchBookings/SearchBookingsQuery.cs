using MediatR;
using TravelBooking.Application.DTOs;

namespace TravelBooking.Application.Queries.SearchBookings;

public record SearchBookingsQuery : IRequest<PagedResult<BookingDto>>
{
    public string? UserId { get; init; }
    public string? Destination { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

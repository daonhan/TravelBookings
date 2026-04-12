using MediatR;
using Reporting.Application.DTOs;
using Reporting.Domain.Interfaces;

namespace Reporting.Application.Queries.GetBookings;

public class GetBookingsQueryHandler : IRequestHandler<GetBookingsQuery, PagedResult<BookingSummaryDto>>
{
    private readonly IBookingSummaryRepository _repository;

    public GetBookingsQueryHandler(IBookingSummaryRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<BookingSummaryDto>> Handle(GetBookingsQuery request, CancellationToken ct)
    {
        var bookings = await _repository.GetAllAsync(request.Page, request.PageSize, ct);
        var totalCount = await _repository.GetTotalCountAsync(ct);

        return new PagedResult<BookingSummaryDto>
        {
            Items = bookings.Select(b => new BookingSummaryDto
            {
                BookingId = b.BookingId,
                UserId = b.UserId,
                Destination = b.Destination,
                TravelDate = b.TravelDate,
                TotalAmount = b.TotalAmount,
                Currency = b.Currency,
                Status = b.Status,
                CreatedAt = b.CreatedAt,
                CancelledAt = b.CancelledAt
            }).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}

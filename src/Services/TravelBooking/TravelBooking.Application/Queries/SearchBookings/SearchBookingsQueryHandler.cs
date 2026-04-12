using MediatR;
using TravelBooking.Application.DTOs;
using TravelBooking.Domain.Interfaces;

namespace TravelBooking.Application.Queries.SearchBookings;

public class SearchBookingsQueryHandler : IRequestHandler<SearchBookingsQuery, PagedResult<BookingDto>>
{
    private readonly IBookingRepository _repository;

    public SearchBookingsQueryHandler(IBookingRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<BookingDto>> Handle(SearchBookingsQuery request, CancellationToken cancellationToken)
    {
        var bookings = await _repository.SearchAsync(
            request.UserId, request.Destination, request.FromDate, request.ToDate,
            request.Page, request.PageSize, cancellationToken);

        int totalCount = await _repository.CountAsync(
            request.UserId, request.Destination, request.FromDate, request.ToDate, cancellationToken);

        return new PagedResult<BookingDto>
        {
            Items = bookings.Select(b => new BookingDto
            {
                Id = b.Id,
                UserId = b.UserId,
                Status = b.Status.ToString(),
                TotalAmount = b.TotalAmount.Amount,
                Currency = b.TotalAmount.Currency,
                PaymentReference = b.PaymentReference,
                CreatedAt = b.CreatedAt,
                ConfirmedAt = b.ConfirmedAt
            }).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}

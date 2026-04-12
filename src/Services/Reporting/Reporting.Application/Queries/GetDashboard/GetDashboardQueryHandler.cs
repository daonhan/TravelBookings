using MediatR;
using Reporting.Application.DTOs;
using Reporting.Domain.Interfaces;

namespace Reporting.Application.Queries.GetDashboard;

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IBookingSummaryRepository _bookingRepo;
    private readonly IEventSummaryRepository _eventRepo;
    private readonly IRevenueRepository _revenueRepo;

    public GetDashboardQueryHandler(
        IBookingSummaryRepository bookingRepo,
        IEventSummaryRepository eventRepo,
        IRevenueRepository revenueRepo)
    {
        _bookingRepo = bookingRepo;
        _eventRepo = eventRepo;
        _revenueRepo = revenueRepo;
    }

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken ct)
    {
        var totalBookings = await _bookingRepo.GetTotalCountAsync(ct);
        var totalEvents = await _eventRepo.GetTotalCountAsync(ct);

        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);
        var totalRevenue = await _revenueRepo.GetTotalRevenueAsync(thirtyDaysAgo, now, ct);

        var recentBookings = await _bookingRepo.GetAllAsync(1, 10, ct);
        var upcomingEvents = await _eventRepo.GetAllAsync(1, 10, ct);

        return new DashboardDto
        {
            TotalBookings = totalBookings,
            TotalEvents = totalEvents,
            TotalRevenue = totalRevenue,
            RecentBookings = recentBookings.Select(b => new BookingSummaryDto
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
            UpcomingEvents = upcomingEvents.Select(e => new EventSummaryDto
            {
                EventId = e.EventId,
                Title = e.Title,
                Location = e.Location,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                Capacity = e.Capacity,
                RegisteredCount = e.RegisteredCount,
                Status = e.Status
            }).ToList()
        };
    }
}

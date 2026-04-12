using Microsoft.EntityFrameworkCore;
using TravelBooking.Domain.Entities;
using TravelBooking.Domain.Interfaces;
using TravelBooking.Infrastructure.Persistence;

namespace TravelBooking.Infrastructure.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly BookingDbContext _context;

    public BookingRepository(BookingDbContext context)
    {
        _context = context;
    }

    public async Task<Booking?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Bookings
            .Include(b => b.Itineraries)
            .Include(b => b.Passengers)
            .FirstOrDefaultAsync(b => b.Id == id, ct);
    }

    public async Task<List<Booking>> SearchAsync(
        string? userId, string? destination, DateTime? fromDate, DateTime? toDate,
        int page, int pageSize, CancellationToken ct = default)
    {
        var query = BuildSearchQuery(userId, destination, fromDate, toDate);

        return await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(
        string? userId, string? destination, DateTime? fromDate, DateTime? toDate,
        CancellationToken ct = default)
    {
        return await BuildSearchQuery(userId, destination, fromDate, toDate).CountAsync(ct);
    }

    public async Task AddAsync(Booking booking, CancellationToken ct = default)
    {
        await _context.Bookings.AddAsync(booking, ct);
    }

    public Task UpdateAsync(Booking booking, CancellationToken ct = default)
    {
        _context.Bookings.Update(booking);
        return Task.CompletedTask;
    }

    private IQueryable<Booking> BuildSearchQuery(
        string? userId, string? destination, DateTime? fromDate, DateTime? toDate)
    {
        IQueryable<Booking> query = _context.Bookings;

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(b => b.UserId == userId);

        if (!string.IsNullOrEmpty(destination))
            query = query.Where(b => b.Itineraries.Any(i => i.Details.Destination == destination));

        if (fromDate.HasValue)
            query = query.Where(b => b.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(b => b.CreatedAt <= toDate.Value);

        return query;
    }
}

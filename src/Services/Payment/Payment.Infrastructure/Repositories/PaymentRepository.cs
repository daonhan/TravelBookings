using Microsoft.EntityFrameworkCore;
using Payment.Domain.Entities;
using Payment.Domain.Interfaces;
using Payment.Infrastructure.Persistence;

namespace Payment.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly PaymentDbContext _context;

    public PaymentRepository(PaymentDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentRecord?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Payments
            .Include(p => p.Transactions)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public async Task<PaymentRecord?> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default)
    {
        return await _context.Payments
            .Include(p => p.Transactions)
            .FirstOrDefaultAsync(p => p.BookingId == bookingId, ct);
    }

    public async Task<List<PaymentRecord>> GetByUserIdAsync(string userId, int page, int pageSize, CancellationToken ct = default)
    {
        return await _context.Payments
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountByUserIdAsync(string userId, CancellationToken ct = default)
    {
        return await _context.Payments.CountAsync(p => p.UserId == userId, ct);
    }

    public async Task AddAsync(PaymentRecord payment, CancellationToken ct = default)
    {
        await _context.Payments.AddAsync(payment, ct);
    }

    public Task UpdateAsync(PaymentRecord payment, CancellationToken ct = default)
    {
        _context.Payments.Update(payment);
        return Task.CompletedTask;
    }
}

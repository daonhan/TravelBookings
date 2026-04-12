using Payment.Domain.Entities;

namespace Payment.Domain.Interfaces;

public interface IPaymentRepository
{
    Task<PaymentRecord?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<PaymentRecord?> GetByBookingIdAsync(Guid bookingId, CancellationToken ct = default);
    Task<List<PaymentRecord>> GetByUserIdAsync(string userId, int page, int pageSize, CancellationToken ct = default);
    Task<int> CountByUserIdAsync(string userId, CancellationToken ct = default);
    Task AddAsync(PaymentRecord payment, CancellationToken ct = default);
    Task UpdateAsync(PaymentRecord payment, CancellationToken ct = default);
}

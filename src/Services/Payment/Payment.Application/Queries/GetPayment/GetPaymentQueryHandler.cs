using MediatR;
using Payment.Application.DTOs;
using Payment.Domain.Interfaces;

namespace Payment.Application.Queries.GetPayment;

public class GetPaymentQueryHandler : IRequestHandler<GetPaymentQuery, PaymentDto?>
{
    private readonly IPaymentRepository _repository;

    public GetPaymentQueryHandler(IPaymentRepository repository)
    {
        _repository = repository;
    }

    public async Task<PaymentDto?> Handle(GetPaymentQuery request, CancellationToken cancellationToken)
    {
        var payment = await _repository.GetByIdAsync(request.PaymentId, cancellationToken);
        if (payment is null) return null;

        return new PaymentDto
        {
            Id = payment.Id,
            BookingId = payment.BookingId,
            UserId = payment.UserId,
            Amount = payment.Amount.Amount,
            Currency = payment.Amount.Currency,
            Method = payment.Method.ToString(),
            Status = payment.Status.ToString(),
            GatewayTransactionId = payment.GatewayTransactionId,
            CreatedAt = payment.CreatedAt,
            ProcessedAt = payment.ProcessedAt,
            Transactions = payment.Transactions.Select(t => new TransactionDto
            {
                Id = t.Id,
                Type = t.Type,
                Amount = t.Amount,
                GatewayReference = t.GatewayReference,
                CreatedAt = t.CreatedAt
            }).ToList()
        };
    }
}

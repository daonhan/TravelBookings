using MediatR;
using Payment.Application.DTOs;
using Payment.Domain.Interfaces;

namespace Payment.Application.Commands.RefundPayment;

public class RefundPaymentCommandHandler : IRequestHandler<RefundPaymentCommand, PaymentDto>
{
    private readonly IPaymentRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public RefundPaymentCommandHandler(IPaymentRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PaymentDto> Handle(RefundPaymentCommand request, CancellationToken cancellationToken)
    {
        var payment = await _repository.GetByIdAsync(request.PaymentId, cancellationToken)
            ?? throw new KeyNotFoundException($"Payment {request.PaymentId} not found");

        string gatewayRefundId = $"REF-{Guid.NewGuid():N}"[..20];
        payment.Refund(request.RefundAmount, gatewayRefundId);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

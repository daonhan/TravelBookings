using MediatR;
using Payment.Application.DTOs;

namespace Payment.Application.Commands.RefundPayment;

public record RefundPaymentCommand : IRequest<PaymentDto>
{
    public Guid PaymentId { get; init; }
    public decimal RefundAmount { get; init; }
}

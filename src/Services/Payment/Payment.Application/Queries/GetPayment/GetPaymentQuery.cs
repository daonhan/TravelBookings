using MediatR;
using Payment.Application.DTOs;

namespace Payment.Application.Queries.GetPayment;

public record GetPaymentQuery(Guid PaymentId) : IRequest<PaymentDto?>;

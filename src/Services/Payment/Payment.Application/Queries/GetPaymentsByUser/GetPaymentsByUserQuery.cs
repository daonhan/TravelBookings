using MediatR;
using Payment.Application.DTOs;

namespace Payment.Application.Queries.GetPaymentsByUser;

public record GetPaymentsByUserQuery : IRequest<PagedResult<PaymentDto>>
{
    public string UserId { get; init; } = string.Empty;
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

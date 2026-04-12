using MediatR;
using Payment.Application.DTOs;
using Payment.Domain.Interfaces;

namespace Payment.Application.Queries.GetPaymentsByUser;

public class GetPaymentsByUserQueryHandler : IRequestHandler<GetPaymentsByUserQuery, PagedResult<PaymentDto>>
{
    private readonly IPaymentRepository _repository;

    public GetPaymentsByUserQueryHandler(IPaymentRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<PaymentDto>> Handle(GetPaymentsByUserQuery request, CancellationToken cancellationToken)
    {
        var payments = await _repository.GetByUserIdAsync(request.UserId, request.Page, request.PageSize, cancellationToken);
        int totalCount = await _repository.CountByUserIdAsync(request.UserId, cancellationToken);

        return new PagedResult<PaymentDto>
        {
            Items = payments.Select(p => new PaymentDto
            {
                Id = p.Id,
                BookingId = p.BookingId,
                UserId = p.UserId,
                Amount = p.Amount.Amount,
                Currency = p.Amount.Currency,
                Method = p.Method.ToString(),
                Status = p.Status.ToString(),
                GatewayTransactionId = p.GatewayTransactionId,
                CreatedAt = p.CreatedAt,
                ProcessedAt = p.ProcessedAt
            }).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}

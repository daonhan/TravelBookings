using MediatR;
using Reporting.Application.DTOs;
using Reporting.Domain.Interfaces;

namespace Reporting.Application.Queries.GetRevenue;

public class GetRevenueQueryHandler : IRequestHandler<GetRevenueQuery, RevenueReportDto>
{
    private readonly IRevenueRepository _repository;

    public GetRevenueQueryHandler(IRevenueRepository repository)
    {
        _repository = repository;
    }

    public async Task<RevenueReportDto> Handle(GetRevenueQuery request, CancellationToken ct)
    {
        var records = await _repository.GetByDateRangeAsync(request.FromDate, request.ToDate, ct);
        var totalRevenue = await _repository.GetTotalRevenueAsync(request.FromDate, request.ToDate, ct);

        return new RevenueReportDto
        {
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            TotalRevenue = totalRevenue,
            TransactionCount = records.Count,
            Items = records.Select(r => new RevenueItemDto
            {
                PaymentId = r.PaymentId,
                BookingId = r.BookingId,
                Amount = r.Amount,
                Status = r.Status,
                ProcessedAt = r.ProcessedAt
            }).ToList()
        };
    }
}

using MediatR;
using Reporting.Application.DTOs;

namespace Reporting.Application.Queries.GetRevenue;

public class GetRevenueQuery : IRequest<RevenueReportDto>
{
    public DateTime FromDate { get; init; }
    public DateTime ToDate { get; init; }
}

using MediatR;
using Reporting.Application.DTOs;

namespace Reporting.Application.Queries.GetDashboard;

public record GetDashboardQuery : IRequest<DashboardDto>;

using MediatR;
using Notification.Application.DTOs;

namespace Notification.Application.Queries.GetUserPreference;

public record GetUserPreferenceQuery(string UserId) : IRequest<UserPreferenceDto?>;

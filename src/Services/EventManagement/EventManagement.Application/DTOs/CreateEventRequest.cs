namespace EventManagement.Application.DTOs;

public record CreateEventRequest
{
    public string OrganizerId { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Venue { get; init; } = string.Empty;
    public string Street { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int Capacity { get; init; }
    public string Categories { get; init; } = string.Empty;
    public List<CreateSessionRequest> Sessions { get; init; } = [];
}

public record CreateSessionRequest
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Speaker { get; init; } = string.Empty;
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public int Capacity { get; init; }
}

public record RegisterAttendeeRequest
{
    public string UserId { get; init; } = string.Empty;
    public string AttendeeName { get; init; } = string.Empty;
    public string RegistrationType { get; init; } = "Standard";
    public string? SessionPreferences { get; init; }
}

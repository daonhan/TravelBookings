namespace EventManagement.Application.DTOs;

public record EventDto
{
    public Guid Id { get; init; }
    public string OrganizerId { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Venue { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int Capacity { get; init; }
    public int AvailableCapacity { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Categories { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public List<SessionDto> Sessions { get; init; } = [];
    public List<RegistrationDto> Registrations { get; init; } = [];
}

public record SessionDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Speaker { get; init; } = string.Empty;
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public int Capacity { get; init; }
}

public record RegistrationDto
{
    public Guid Id { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string AttendeeName { get; init; } = string.Empty;
    public string RegistrationType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime RegisteredAt { get; init; }
}

public record PagedResult<T>
{
    public List<T> Items { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

using EventManagement.Domain.Enums;

namespace EventManagement.Domain.Entities;

public class Registration
{
    public Guid Id { get; set; }
    public Guid OrgEventId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string AttendeeName { get; set; } = string.Empty;
    public RegistrationType RegistrationType { get; set; }
    public RegistrationStatus Status { get; set; }
    public string SessionPreferences { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public DateTime? CancelledAt { get; set; }
}

namespace EventManagement.Domain.Entities;

public class Session
{
    public Guid Id { get; set; }
    public Guid OrgEventId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Speaker { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int Capacity { get; set; }
}

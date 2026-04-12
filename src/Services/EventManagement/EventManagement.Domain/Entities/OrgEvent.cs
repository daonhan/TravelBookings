using MediatR;
using EventManagement.Domain.Enums;
using EventManagement.Domain.Events;
using EventManagement.Domain.ValueObjects;

namespace EventManagement.Domain.Entities;

public class OrgEvent
{
    private readonly List<Session> _sessions = [];
    private readonly List<Registration> _registrations = [];
    private readonly List<INotification> _domainEvents = [];

    public Guid Id { get; private set; }
    public string OrganizerId { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Address Location { get; private set; } = new();
    public DateRange Schedule { get; private set; } = new();
    public int Capacity { get; private set; }
    public EventStatus Status { get; private set; }
    public string Categories { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public byte[] RowVersion { get; private set; } = [];

    public IReadOnlyCollection<Session> Sessions => _sessions.AsReadOnly();
    public IReadOnlyCollection<Registration> Registrations => _registrations.AsReadOnly();
    public IReadOnlyCollection<INotification> DomainEvents => _domainEvents.AsReadOnly();

    private OrgEvent() { } // EF Core

    public static OrgEvent Create(
        string organizerId,
        string title,
        string description,
        Address location,
        DateRange schedule,
        int capacity,
        string categories)
    {
        var orgEvent = new OrgEvent
        {
            Id = Guid.NewGuid(),
            OrganizerId = organizerId,
            Title = title,
            Description = description,
            Location = location,
            Schedule = schedule,
            Capacity = capacity,
            Status = EventStatus.Draft,
            Categories = categories,
            CreatedAt = DateTime.UtcNow
        };

        orgEvent._domainEvents.Add(new EventCreatedDomainEvent(orgEvent.Id, DateTime.UtcNow));
        return orgEvent;
    }

    public void Update(string title, string description, Address location, DateRange schedule, int capacity, string categories)
    {
        if (Status == EventStatus.Cancelled)
            throw new InvalidOperationException("Cannot update a cancelled event");

        Title = title;
        Description = description;
        Location = location;
        Schedule = schedule;
        Capacity = capacity;
        Categories = categories;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Publish()
    {
        if (Status != EventStatus.Draft)
            throw new InvalidOperationException($"Cannot publish event in {Status} state");

        Status = EventStatus.Published;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == EventStatus.Cancelled)
            throw new InvalidOperationException("Event is already cancelled");

        Status = EventStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        _domainEvents.Add(new EventCancelledDomainEvent(Id, reason, DateTime.UtcNow));
    }

    public void AddSession(string title, string description, string speaker, DateTime startTime, DateTime endTime, int capacity)
    {
        var session = new Session
        {
            Id = Guid.NewGuid(),
            OrgEventId = Id,
            Title = title,
            Description = description,
            Speaker = speaker,
            StartTime = startTime,
            EndTime = endTime,
            Capacity = capacity
        };
        _sessions.Add(session);
    }

    public Registration RegisterAttendee(string userId, string attendeeName, RegistrationType registrationType, string? sessionPreferences = null)
    {
        if (Status != EventStatus.Published)
            throw new InvalidOperationException($"Cannot register for event in {Status} state");

        int confirmedCount = _registrations.Count(r => r.Status == RegistrationStatus.Confirmed);
        if (confirmedCount >= Capacity)
            throw new InvalidOperationException("Event has reached maximum capacity");

        if (_registrations.Any(r => r.UserId == userId && r.Status != RegistrationStatus.Cancelled))
            throw new InvalidOperationException("User is already registered for this event");

        var registration = new Registration
        {
            Id = Guid.NewGuid(),
            OrgEventId = Id,
            UserId = userId,
            AttendeeName = attendeeName,
            RegistrationType = registrationType,
            SessionPreferences = sessionPreferences ?? string.Empty,
            Status = RegistrationStatus.Confirmed,
            RegisteredAt = DateTime.UtcNow
        };

        _registrations.Add(registration);
        _domainEvents.Add(new AttendeeRegisteredDomainEvent(registration.Id, Id, userId, DateTime.UtcNow));

        return registration;
    }

    public int AvailableCapacity => Capacity - _registrations.Count(r => r.Status == RegistrationStatus.Confirmed);

    public void ClearDomainEvents() => _domainEvents.Clear();
}

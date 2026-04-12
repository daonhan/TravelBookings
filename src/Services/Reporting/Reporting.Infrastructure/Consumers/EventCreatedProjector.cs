using MassTransit;
using Microsoft.Extensions.Logging;
using TravelBookings.Common.Events.Contracts;
using Reporting.Domain.Interfaces;
using Reporting.Domain.ReadModels;

namespace Reporting.Infrastructure.Consumers;

public class EventCreatedProjector : IConsumer<EventCreatedEvent>
{
    private readonly IEventSummaryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<EventCreatedProjector> _logger;

    public EventCreatedProjector(
        IEventSummaryRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<EventCreatedProjector> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<EventCreatedEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Projecting EventCreated for EventId: {EventId}", msg.EventId);

        var existing = await _repository.GetByEventIdAsync(msg.EventId);
        if (existing is not null) return;

        var summary = new EventSummary
        {
            Id = Guid.NewGuid(),
            EventId = msg.EventId,
            Title = msg.Title,
            Location = msg.Location,
            StartDate = msg.StartDate,
            EndDate = msg.EndDate,
            Capacity = msg.Capacity,
            RegisteredCount = 0,
            Status = "Published",
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(summary);
        await _unitOfWork.SaveChangesAsync();
    }
}

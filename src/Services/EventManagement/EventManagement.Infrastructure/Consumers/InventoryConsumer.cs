using MassTransit;
using Microsoft.Extensions.Logging;
using TravelBookings.Common.Events.Commands;
using TravelBookings.Common.Events.Responses;

namespace EventManagement.Infrastructure.Consumers;

public class ReserveInventoryConsumer : IConsumer<ReserveInventoryCommand>
{
    private readonly ILogger<ReserveInventoryConsumer> _logger;

    public ReserveInventoryConsumer(ILogger<ReserveInventoryConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ReserveInventoryCommand> context)
    {
        _logger.LogInformation("Reserving inventory for booking {BookingId}, Destination: {Destination}",
            context.Message.BookingId, context.Message.Destination);

        // Simulate reservation delay
        await Task.Delay(100);

        await context.Publish(new InventoryReservedEvent
        {
            CorrelationId = context.Message.CorrelationId,
            BookingId = context.Message.BookingId,
            AllocationId = Guid.NewGuid(),
            ReservedUntil = DateTime.UtcNow.AddMinutes(30)
        });

        _logger.LogInformation("Inventory reserved for booking {BookingId}", context.Message.BookingId);
    }
}

public class ReleaseInventoryConsumer : IConsumer<ReleaseInventoryCommand>
{
    private readonly ILogger<ReleaseInventoryConsumer> _logger;

    public ReleaseInventoryConsumer(ILogger<ReleaseInventoryConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ReleaseInventoryCommand> context)
    {
        _logger.LogInformation("Releasing inventory for booking {BookingId}, Reason: {Reason}",
            context.Message.BookingId, context.Message.Reason);

        await Task.Delay(50);

        await context.Publish(new InventoryReleasedEvent
        {
            CorrelationId = context.Message.CorrelationId,
            BookingId = context.Message.BookingId
        });

        _logger.LogInformation("Inventory released for booking {BookingId}", context.Message.BookingId);
    }
}

using MassTransit;
using Microsoft.Extensions.Logging;
using TravelBookings.Common.Events.Contracts;
using Reporting.Domain.Interfaces;

namespace Reporting.Infrastructure.Consumers;

public class BookingCancelledProjector : IConsumer<BookingCancelledEvent>
{
    private readonly IBookingSummaryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BookingCancelledProjector> _logger;

    public BookingCancelledProjector(
        IBookingSummaryRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<BookingCancelledProjector> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<BookingCancelledEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Projecting BookingCancelled for BookingId: {BookingId}", msg.BookingId);

        var existing = await _repository.GetByBookingIdAsync(msg.BookingId);
        if (existing is null) return;

        existing.Status = "Cancelled";
        existing.CancelledAt = DateTime.UtcNow;
        existing.CancellationReason = msg.Reason;

        await _repository.UpdateAsync(existing);
        await _unitOfWork.SaveChangesAsync();
    }
}

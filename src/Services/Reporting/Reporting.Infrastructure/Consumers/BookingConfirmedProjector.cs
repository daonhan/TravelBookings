using MassTransit;
using Microsoft.Extensions.Logging;
using TravelBookings.Common.Events.Contracts;
using Reporting.Domain.Interfaces;
using Reporting.Domain.ReadModels;

namespace Reporting.Infrastructure.Consumers;

public class BookingConfirmedProjector : IConsumer<BookingConfirmedEvent>
{
    private readonly IBookingSummaryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BookingConfirmedProjector> _logger;

    public BookingConfirmedProjector(
        IBookingSummaryRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<BookingConfirmedProjector> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<BookingConfirmedEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Projecting BookingConfirmed for BookingId: {BookingId}", msg.BookingId);

        var existing = await _repository.GetByBookingIdAsync(msg.BookingId);
        if (existing is not null) return; // Idempotent

        var summary = new BookingSummary
        {
            Id = Guid.NewGuid(),
            BookingId = msg.BookingId,
            UserId = msg.UserId,
            Destination = msg.Destination,
            TravelDate = msg.DepartureDate,
            TotalAmount = msg.TotalAmount,
            Currency = msg.Currency,
            Status = "Confirmed",
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(summary);
        await _unitOfWork.SaveChangesAsync();
    }
}

using MassTransit;
using Microsoft.Extensions.Logging;
using TravelBookings.Common.Events.Contracts;
using Reporting.Domain.Interfaces;
using Reporting.Domain.ReadModels;

namespace Reporting.Infrastructure.Consumers;

public class PaymentProcessedProjector : IConsumer<PaymentProcessedEvent>
{
    private readonly IRevenueRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PaymentProcessedProjector> _logger;

    public PaymentProcessedProjector(
        IRevenueRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<PaymentProcessedProjector> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentProcessedEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Projecting PaymentProcessed for PaymentId: {PaymentId}", msg.PaymentId);

        var record = new RevenueRecord
        {
            Id = Guid.NewGuid(),
            PaymentId = msg.PaymentId,
            BookingId = msg.BookingId,
            UserId = msg.UserId,
            Amount = msg.Amount,
            Currency = msg.Currency,
            PaymentMethod = msg.Method,
            Status = msg.Status,
            ProcessedAt = msg.ProcessedAt
        };

        await _repository.AddAsync(record);
        await _unitOfWork.SaveChangesAsync();
    }
}

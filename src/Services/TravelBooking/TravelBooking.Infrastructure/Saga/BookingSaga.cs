using MassTransit;
using TravelBookings.Common.Events.Commands;
using TravelBookings.Common.Events.Contracts;
using TravelBookings.Common.Events.Responses;

namespace TravelBooking.Infrastructure.Saga;

public class BookingSaga : MassTransitStateMachine<BookingSagaState>
{
    // States
    public State Requested { get; private set; } = null!;
    public State InventoryReserved { get; private set; } = null!;
    public State PaymentProcessing { get; private set; } = null!;
    public State Confirmed { get; private set; } = null!;
    public State Failed { get; private set; } = null!;
    public State Compensating { get; private set; } = null!;

    // Events
    public Event<BookingSubmittedEvent> BookingSubmitted { get; private set; } = null!;
    public Event<InventoryReservedEvent> InventoryReservedEvent { get; private set; } = null!;
    public Event<InventoryReservationFailedEvent> InventoryReservationFailed { get; private set; } = null!;
    public Event<PaymentProcessedEvent> PaymentProcessed { get; private set; } = null!;
    public Event<PaymentFailedEvent> PaymentFailed { get; private set; } = null!;
    public Event<InventoryReleasedEvent> InventoryReleased { get; private set; } = null!;

    // Timeout schedule
    public Schedule<BookingSagaState, PaymentTimeoutExpired> PaymentTimeout { get; private set; } = null!;

    public BookingSaga()
    {
        InstanceState(x => x.CurrentState);

        Event(() => BookingSubmitted, x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => InventoryReservedEvent, x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => InventoryReservationFailed, x => x.CorrelateById(ctx => ctx.Message.CorrelationId));
        Event(() => PaymentProcessed, x => x.CorrelateById(ctx => Guid.Parse(ctx.Message.CorrelationId)));
        Event(() => PaymentFailed, x => x.CorrelateById(ctx => Guid.Parse(ctx.Message.CorrelationId)));
        Event(() => InventoryReleased, x => x.CorrelateById(ctx => ctx.Message.CorrelationId));

        Schedule(() => PaymentTimeout, x => x.PaymentTimeoutTokenId, s =>
        {
            s.Delay = TimeSpan.FromSeconds(30);
            s.Received = x => x.CorrelateById(ctx => ctx.Message.CorrelationId);
        });

        // Initial state: booking submitted
        Initially(
            When(BookingSubmitted)
                .Then(ctx =>
                {
                    ctx.Saga.BookingId = ctx.Message.BookingId;
                    ctx.Saga.UserId = ctx.Message.UserId;
                    ctx.Saga.Amount = ctx.Message.Amount;
                    ctx.Saga.Currency = ctx.Message.Currency;
                    ctx.Saga.Destination = ctx.Message.Destination;
                    ctx.Saga.DepartureDate = ctx.Message.DepartureDate;
                    ctx.Saga.PassengerCount = ctx.Message.PassengerCount;
                    ctx.Saga.Created = DateTime.UtcNow;
                })
                .Publish(ctx => new ReserveInventoryCommand
                {
                    CorrelationId = ctx.Saga.CorrelationId,
                    BookingId = ctx.Saga.BookingId,
                    Destination = ctx.Saga.Destination,
                    DepartureDate = ctx.Saga.DepartureDate,
                    PassengerCount = ctx.Saga.PassengerCount
                })
                .TransitionTo(Requested)
        );

        // Inventory reserved → request payment
        During(Requested,
            When(InventoryReservedEvent)
                .Then(ctx =>
                {
                    ctx.Saga.AllocationId = ctx.Message.AllocationId;
                    ctx.Saga.Updated = DateTime.UtcNow;
                })
                .Schedule(PaymentTimeout, ctx => new PaymentTimeoutExpired { CorrelationId = ctx.Saga.CorrelationId })
                .Publish(ctx => new ProcessPaymentCommand
                {
                    CorrelationId = ctx.Saga.CorrelationId,
                    BookingId = ctx.Saga.BookingId,
                    UserId = ctx.Saga.UserId,
                    Amount = ctx.Saga.Amount,
                    Currency = ctx.Saga.Currency
                })
                .TransitionTo(PaymentProcessing),

            When(InventoryReservationFailed)
                .Then(ctx => ctx.Saga.Updated = DateTime.UtcNow)
                .TransitionTo(Failed)
                .Finalize()
        );

        // Payment processing → confirmed or compensating
        During(PaymentProcessing,
            When(PaymentProcessed)
                .Unschedule(PaymentTimeout)
                .Then(ctx =>
                {
                    ctx.Saga.PaymentReference = ctx.Message.PaymentId.ToString();
                    ctx.Saga.Updated = DateTime.UtcNow;
                })
                .Publish(ctx => new BookingConfirmedEvent
                {
                    CorrelationId = ctx.Saga.CorrelationId.ToString(),
                    BookingId = ctx.Saga.BookingId,
                    UserId = ctx.Saga.UserId,
                    TotalAmount = ctx.Saga.Amount,
                    Currency = ctx.Saga.Currency,
                    Destination = ctx.Saga.Destination,
                    DepartureDate = ctx.Saga.DepartureDate,
                    PassengerCount = ctx.Saga.PassengerCount,
                    PaymentReference = ctx.Saga.PaymentReference
                })
                .TransitionTo(Confirmed)
                .Finalize(),

            When(PaymentFailed)
                .Unschedule(PaymentTimeout)
                .Then(ctx => ctx.Saga.Updated = DateTime.UtcNow)
                .Publish(ctx => new ReleaseInventoryCommand
                {
                    CorrelationId = ctx.Saga.CorrelationId,
                    BookingId = ctx.Saga.BookingId,
                    AllocationId = ctx.Saga.AllocationId,
                    Reason = "Payment failed"
                })
                .TransitionTo(Compensating),

            When(PaymentTimeout!.Received)
                .Then(ctx => ctx.Saga.Updated = DateTime.UtcNow)
                .Publish(ctx => new ReleaseInventoryCommand
                {
                    CorrelationId = ctx.Saga.CorrelationId,
                    BookingId = ctx.Saga.BookingId,
                    AllocationId = ctx.Saga.AllocationId,
                    Reason = "Payment timeout"
                })
                .TransitionTo(Compensating)
        );

        // Compensation → release inventory → failed
        During(Compensating,
            When(InventoryReleased)
                .Then(ctx => ctx.Saga.Updated = DateTime.UtcNow)
                .Publish(ctx => new BookingCancelledEvent
                {
                    CorrelationId = ctx.Saga.CorrelationId.ToString(),
                    BookingId = ctx.Saga.BookingId,
                    UserId = ctx.Saga.UserId,
                    Reason = "Payment failed or timed out",
                    RefundAmount = ctx.Saga.Amount,
                    Currency = ctx.Saga.Currency
                })
                .TransitionTo(Failed)
                .Finalize()
        );

        SetCompletedWhenFinalized();
    }

    // Needed for saga scheduled message state tracking
    public Guid? PaymentTimeoutTokenId { get; set; }
}

// Timeout message
public record PaymentTimeoutExpired
{
    public Guid CorrelationId { get; init; }
}

// Initial trigger event for the saga
public record BookingSubmittedEvent
{
    public Guid CorrelationId { get; init; }
    public Guid BookingId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
    public string Destination { get; init; } = string.Empty;
    public DateTime DepartureDate { get; init; }
    public int PassengerCount { get; init; }
}

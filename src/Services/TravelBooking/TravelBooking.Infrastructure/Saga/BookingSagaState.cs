using MassTransit;

namespace TravelBooking.Infrastructure.Saga;

public class BookingSagaState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }
    public string CurrentState { get; set; } = string.Empty;
    public Guid BookingId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureDate { get; set; }
    public int PassengerCount { get; set; }
    public Guid AllocationId { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
    public Guid? PaymentTimeoutTokenId { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

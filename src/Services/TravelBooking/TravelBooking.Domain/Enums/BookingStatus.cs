namespace TravelBooking.Domain.Enums;

public enum BookingStatus
{
    Draft,
    Requested,
    InventoryReserved,
    PaymentProcessing,
    Confirmed,
    Cancelled,
    Failed,
    Compensating
}

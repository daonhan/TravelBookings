using TravelBooking.Domain.Enums;

namespace TravelBooking.Domain.Entities;

public class Allocation
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Guid SupplierId { get; set; }
    public string ResourceType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public AllocationStatus Status { get; set; }
    public DateTime ReservedUntil { get; set; }
}

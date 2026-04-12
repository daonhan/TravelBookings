namespace Payment.Domain.Entities;

public class PaymentTransaction
{
    public Guid Id { get; set; }
    public Guid PaymentRecordId { get; set; }
    public string Type { get; set; } = string.Empty; // CHARGE, REFUND
    public decimal Amount { get; set; }
    public string GatewayReference { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public static PaymentTransaction Create(Guid paymentRecordId, string type, decimal amount, string gatewayReference)
    {
        return new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            PaymentRecordId = paymentRecordId,
            Type = type,
            Amount = amount,
            GatewayReference = gatewayReference,
            CreatedAt = DateTime.UtcNow
        };
    }
}

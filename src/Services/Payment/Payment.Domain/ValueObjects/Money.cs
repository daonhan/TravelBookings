namespace Payment.Domain.ValueObjects;

public record Money
{
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";

    public static Money Zero(string currency = "USD") => new() { Amount = 0, Currency = currency };
}

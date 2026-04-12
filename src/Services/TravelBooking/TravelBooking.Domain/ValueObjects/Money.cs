namespace TravelBooking.Domain.ValueObjects;

public record Money
{
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";

    public static Money Zero(string currency = "USD") => new() { Amount = 0, Currency = currency };

    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException($"Cannot add {a.Currency} and {b.Currency}");
        return new Money { Amount = a.Amount + b.Amount, Currency = a.Currency };
    }

    public static Money operator -(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException($"Cannot subtract {a.Currency} and {b.Currency}");
        return new Money { Amount = a.Amount - b.Amount, Currency = a.Currency };
    }
}

namespace Payment.Application.DTOs;

public record PaymentDto
{
    public Guid Id { get; init; }
    public Guid BookingId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "USD";
    public string Method { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string GatewayTransactionId { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? ProcessedAt { get; init; }
    public List<TransactionDto> Transactions { get; init; } = [];
}

public record TransactionDto
{
    public Guid Id { get; init; }
    public string Type { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string GatewayReference { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public record PagedResult<T>
{
    public List<T> Items { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

using System.Text.Json;
using FluentValidation;

namespace TravelBooking.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        string correlationId = context.Items["CorrelationId"]?.ToString() ?? "unknown";

        var (statusCode, code) = exception switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "VALIDATION_ERROR"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "NOT_FOUND"),
            InvalidOperationException => (StatusCodes.Status409Conflict, "CONFLICT"),
            _ => (StatusCodes.Status500InternalServerError, "INTERNAL_ERROR")
        };

        _logger.LogError(exception, "Unhandled exception: {Code} for CorrelationId: {CorrelationId}",
            code, correlationId);

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            error = new
            {
                code,
                message = exception is ValidationException validationEx
                    ? string.Join("; ", validationEx.Errors.Select(e => e.ErrorMessage))
                    : statusCode == 500 ? "An unexpected error occurred" : exception.Message,
                traceId = correlationId
            }
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}

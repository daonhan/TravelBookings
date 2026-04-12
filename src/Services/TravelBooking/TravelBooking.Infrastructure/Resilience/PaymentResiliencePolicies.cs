using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http.Resilience;
using Polly;

namespace TravelBooking.Infrastructure.Resilience;

public static class PaymentResiliencePolicies
{
    public const string PaymentPipelineName = "PaymentPipeline";

    public static IHttpClientBuilder AddPaymentResilienceHandler(this IHttpClientBuilder builder)
    {
        builder.AddResilienceHandler(PaymentPipelineName, pipeline =>
        {
            // Timeout: 5 seconds per attempt
            pipeline.AddTimeout(TimeSpan.FromSeconds(5));

            // Retry: 3 attempts with exponential backoff
            pipeline.AddRetry(new HttpRetryStrategyOptions
            {
                MaxRetryAttempts = 3,
                BackoffType = DelayBackoffType.Exponential,
                Delay = TimeSpan.FromSeconds(2),
                ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
                    .HandleResult(r => r.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable)
                    .HandleResult(r => r.StatusCode == System.Net.HttpStatusCode.GatewayTimeout)
                    .Handle<HttpRequestException>()
                    .Handle<TaskCanceledException>()
            });

            // Circuit breaker: open after 5 failures in 30s
            pipeline.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
            {
                FailureRatio = 0.5,
                SamplingDuration = TimeSpan.FromSeconds(30),
                MinimumThroughput = 5,
                BreakDuration = TimeSpan.FromSeconds(30),
                ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
                    .HandleResult(r => !r.IsSuccessStatusCode)
                    .Handle<HttpRequestException>()
            });
        });

        return builder;
    }
}

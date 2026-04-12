using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace TravelBookings.Common.Security;

public static class SecurityExtensions
{
    public static IServiceCollection AddPhoenixSecurity(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            string? authority = configuration["Authentication:Authority"];
            string? audience = configuration["Authentication:Audience"];
            string? signingKey = configuration["Authentication:SigningKey"];

            if (!string.IsNullOrEmpty(authority))
            {
                options.Authority = authority;
            }

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = !string.IsNullOrEmpty(authority),
                ValidateAudience = !string.IsNullOrEmpty(audience),
                ValidAudience = audience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = !string.IsNullOrEmpty(signingKey),
                IssuerSigningKey = string.IsNullOrEmpty(signingKey)
                    ? null
                    : new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                ClockSkew = TimeSpan.FromMinutes(5)
            };
        })
        .AddScheme<AuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(
            "ApiKey", _ => { });

        services.AddAuthorization();

        return services;
    }
}

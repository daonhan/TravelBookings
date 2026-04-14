using TravelBookings.Common.HealthChecks;
using TravelBookings.Common.Logging;
using TravelBookings.Common.Security;
using Serilog;
using Microsoft.EntityFrameworkCore;
using TravelBooking.API.Middleware;
using TravelBooking.Application;
using TravelBooking.Infrastructure;
using TravelBooking.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((context, config) =>
    SerilogConfiguration.CreateDefaultConfiguration(context.Configuration, "travel-booking-service"));

// Services
builder.Services.AddPhoenixLogging();
builder.Services.AddPhoenixSecurity(builder.Configuration);
builder.Services.AddPhoenixHealthChecks(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Travel Booking Service", Version = "v1" });
});

var app = builder.Build();

// Auto-run EF Core migrations in Docker environment
if (app.Environment.IsEnvironment("Docker"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
    await db.Database.MigrateAsync();
}

// Middleware pipeline
app.UseCorrelationId();
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapPhoenixHealthChecks();

app.Run();

// Make Program accessible for integration tests
public partial class Program { }

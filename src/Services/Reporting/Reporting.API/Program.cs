using TravelBookings.Common.HealthChecks;
using TravelBookings.Common.Logging;
using TravelBookings.Common.Security;
using Serilog;
using Microsoft.EntityFrameworkCore;
using Reporting.API.Middleware;
using Reporting.Application;
using Reporting.Infrastructure;
using Reporting.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, config) =>
    SerilogConfiguration.CreateDefaultConfiguration(context.Configuration, "reporting-service"));

builder.Services.AddPhoenixLogging();
builder.Services.AddPhoenixSecurity(builder.Configuration);
builder.Services.AddPhoenixHealthChecks(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Reporting Service", Version = "v1" });
});

var app = builder.Build();

// Auto-run EF Core migrations in Docker environment
if (app.Environment.IsEnvironment("Docker"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ReportingDbContext>();
    await db.Database.MigrateAsync();
}

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

public partial class Program { }

using TrAuckApi.Hubs;
using TrAuckApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ErrorHandlingMiddleware>();

app.MapControllers();
app.MapHub<TripHub>("/hubs/trips");
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();

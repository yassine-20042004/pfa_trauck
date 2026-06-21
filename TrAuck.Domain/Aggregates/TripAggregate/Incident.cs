namespace TrAuckDomain.Aggregates.TripAggregate;

public class Incident
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = "Low"; // Low, Medium, High, Critical
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
}

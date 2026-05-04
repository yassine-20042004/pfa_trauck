namespace TrAuckDomain.Aggregates.TripAggregate;

public class Incident
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TripId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
    public string Severity { get; set; } = "Low";
}

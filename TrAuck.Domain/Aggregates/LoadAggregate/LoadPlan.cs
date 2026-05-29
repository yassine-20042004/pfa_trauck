namespace TrAuckDomain.Aggregates.LoadAggregate;

public class LoadPlan
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string Description { get; set; } = string.Empty;
    public double TotalWeight { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


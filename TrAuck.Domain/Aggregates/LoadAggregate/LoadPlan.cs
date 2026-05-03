namespace TrAuckDomain.Aggregates.LoadAggregate;

public class LoadPlan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TripId { get; set; }
    public double TotalWeight { get; set; }
    public string Description { get; set; } = string.Empty;
}

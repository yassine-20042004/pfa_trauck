namespace TrAuckDomain.Aggregates.FleetAggregate;

public class Vehicle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public double Capacity { get; set; }
}

namespace TrAuckDomain.Aggregates.TripAggregate;

public class Trip
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }
    public string Status { get; set; } = "Pending";
}

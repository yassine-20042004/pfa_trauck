namespace TrAuckDomain.Aggregates.TripAggregate;

public class Trip
{
    public Guid Id { get; set; }
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string Status { get; set; } = "Planned"; // Planned, Ongoing, Completed, Cancelled
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }
    public DateTime? DepartedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


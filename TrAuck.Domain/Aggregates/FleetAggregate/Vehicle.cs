namespace TrAuckDomain.Aggregates.FleetAggregate;

public class Vehicle
{
    public Guid Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Type { get; set; } = string.Empty; // e.g., SemiTruck, Flatbed, CargoVan
    public double CapacityTons { get; set; }
    public string Status { get; set; } = "Available"; // Available, InTransit, Maintenance
}


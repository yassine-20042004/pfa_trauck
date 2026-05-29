namespace TrAuckDomain.Aggregates.FleetAggregate;

public class Driver
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; } // Link to Identity User
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
    public double Rating { get; set; } = 5.0;
}


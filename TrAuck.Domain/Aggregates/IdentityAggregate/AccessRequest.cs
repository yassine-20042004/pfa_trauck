using System;

namespace TrAuckDomain.Aggregates.IdentityAggregate;

public class AccessRequest
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string RequestedRole { get; set; } = string.Empty;
    public string CompanyOrReason { get; set; } = string.Empty;
    
    // Driver-specific nullable fields
    public string? LicenseNumber { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? PreferredVehicle { get; set; }

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending";
}

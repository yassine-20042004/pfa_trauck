using Microsoft.EntityFrameworkCore;
using TrAuckDomain.Aggregates.FleetAggregate;
using TrAuckDomain.Aggregates.LoadAggregate;
using TrAuckDomain.Aggregates.TripAggregate;
using TrAuckDomain.Aggregates.IdentityAggregate;

using TrAuckApplication.Common.Interfaces;

namespace TrAuckInfrastructure.Persistence;

public class AppDbContext : DbContext, IApplicationDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Driver> Drivers { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Trip> Trips { get; set; }
    public DbSet<LoadPlan> LoadPlans { get; set; }
    public DbSet<CargoItem> CargoItems { get; set; }
    public DbSet<DeliveryStop> DeliveryStops { get; set; }
    public DbSet<Incident> Incidents { get; set; }
    public DbSet<AccessRequest> AccessRequests { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Seed Default Admin User
        var adminId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = adminId,
            FirstName = "System",
            LastName = "Admin",
            Email = "admin@admin.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), // Seeded password hash
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
    }
}

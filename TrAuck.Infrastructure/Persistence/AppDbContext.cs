using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.FleetAggregate;
using TrAuckDomain.Aggregates.TripAggregate;
using TrAuckDomain.Aggregates.LoadAggregate;

namespace TrAuckInfrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Driver> Drivers { get; set; } = null!;
    public DbSet<Vehicle> Vehicles { get; set; } = null!;
    public DbSet<Trip> Trips { get; set; } = null!;
    public DbSet<LoadPlan> LoadPlans { get; set; } = null!;
    public DbSet<Incident> Incidents { get; set; } = null!;
}

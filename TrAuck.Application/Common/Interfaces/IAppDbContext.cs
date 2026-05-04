using Microsoft.EntityFrameworkCore;
using TrAuckDomain.Aggregates.FleetAggregate;
using TrAuckDomain.Aggregates.TripAggregate;
using TrAuckDomain.Aggregates.LoadAggregate;

namespace TrAuckApplication.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Driver> Drivers { get; }
    DbSet<Vehicle> Vehicles { get; }
    DbSet<Trip> Trips { get; }
    DbSet<LoadPlan> LoadPlans { get; }
    DbSet<Incident> Incidents { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

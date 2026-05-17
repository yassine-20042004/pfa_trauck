using Microsoft.EntityFrameworkCore;
using TrAuckDomain.Aggregates.FleetAggregate;
using TrAuckDomain.Aggregates.IdentityAggregate;
using TrAuckDomain.Aggregates.LoadAggregate;
using TrAuckDomain.Aggregates.TripAggregate;

namespace TrAuckApplication.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Driver> Drivers { get; }
    DbSet<Vehicle> Vehicles { get; }
    DbSet<Trip> Trips { get; }
    DbSet<LoadPlan> LoadPlans { get; }
    DbSet<CargoItem> CargoItems { get; }
    DbSet<DeliveryStop> DeliveryStops { get; }
    DbSet<AccessRequest> AccessRequests { get; }
    DbSet<User> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}


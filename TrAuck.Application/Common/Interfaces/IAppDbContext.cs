using Microsoft.EntityFrameworkCore;
using TrAuckDomain.Aggregates.FleetAggregate;

namespace TrAuckApplication.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Driver> Drivers { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

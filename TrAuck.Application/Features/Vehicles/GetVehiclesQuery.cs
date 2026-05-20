using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.FleetAggregate;

namespace TrAuckApplication.Features.Vehicles;

public class GetVehiclesQuery : IRequest<List<Vehicle>>
{
}

public class GetVehiclesQueryHandler : IRequestHandler<GetVehiclesQuery, List<Vehicle>>
{
    private readonly IApplicationDbContext _context;

    public GetVehiclesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Vehicle>> Handle(GetVehiclesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Vehicles.ToListAsync(cancellationToken);
    }
}

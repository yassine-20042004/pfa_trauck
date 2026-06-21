using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.FleetAggregate;

namespace TrAuckApplication.Features.Vehicles;

public class GetVehicleByIdQuery : IRequest<Vehicle?>
{
    public Guid Id { get; set; }
}

public class GetVehicleByIdQueryHandler : IRequestHandler<GetVehicleByIdQuery, Vehicle?>
{
    private readonly IApplicationDbContext _context;

    public GetVehicleByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Vehicle?> Handle(GetVehicleByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Vehicles.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckDomain.Aggregates.FleetAggregate;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Vehicles;

public record GetVehiclesQuery() : IRequest<List<VehicleDto>>;

public record VehicleDto(Guid Id, string Make, string Model, string LicensePlate, double Capacity);

public class GetVehiclesQueryHandler : IRequestHandler<GetVehiclesQuery, List<VehicleDto>>
{
    private readonly IAppDbContext _context;

    public GetVehiclesQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<VehicleDto>> Handle(GetVehiclesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Vehicles
            .Select(v => new VehicleDto(v.Id, v.Make, v.Model, v.LicensePlate, v.Capacity))
            .ToListAsync(cancellationToken);
    }
}

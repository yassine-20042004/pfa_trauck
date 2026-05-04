using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckDomain.Aggregates.TripAggregate;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Trips;

public record GetTripsQuery() : IRequest<List<TripDto>>;

public record TripDto(Guid Id, string Origin, string Destination, Guid DriverId, Guid VehicleId, string Status);

public class GetTripsQueryHandler : IRequestHandler<GetTripsQuery, List<TripDto>>
{
    private readonly IAppDbContext _context;

    public GetTripsQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<TripDto>> Handle(GetTripsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Trips
            .Select(t => new TripDto(t.Id, t.Origin, t.Destination, t.DriverId, t.VehicleId, t.Status))
            .ToListAsync(cancellationToken);
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.TripAggregate;

namespace TrAuckApplication.Features.Trips.Queries;

public class GetTripsQuery : IRequest<List<Trip>>
{
}

public class GetTripsQueryHandler : IRequestHandler<GetTripsQuery, List<Trip>>
{
    private readonly IApplicationDbContext _context;

    public GetTripsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Trip>> Handle(GetTripsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Trips.ToListAsync(cancellationToken);
    }
}

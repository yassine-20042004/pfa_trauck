using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.FleetAggregate;

namespace TrAuckApplication.Features.Drivers;

public class GetDriversQuery : IRequest<List<Driver>>
{
}

public class GetDriversQueryHandler : IRequestHandler<GetDriversQuery, List<Driver>>
{
    private readonly IApplicationDbContext _context;

    public GetDriversQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Driver>> Handle(GetDriversQuery request, CancellationToken cancellationToken)
    {
        return await _context.Drivers.ToListAsync(cancellationToken);
    }
}

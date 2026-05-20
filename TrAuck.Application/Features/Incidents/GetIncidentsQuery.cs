using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.TripAggregate;

namespace TrAuckApplication.Features.Incidents;

public class GetIncidentsQuery : IRequest<List<Incident>>
{
}

public class GetIncidentsQueryHandler : IRequestHandler<GetIncidentsQuery, List<Incident>>
{
    private readonly IApplicationDbContext _context;

    public GetIncidentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Incident>> Handle(GetIncidentsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Incidents
            .OrderByDescending(i => i.ReportedAt)
            .ToListAsync(cancellationToken);
    }
}

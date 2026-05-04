using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckDomain.Aggregates.TripAggregate;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Incidents;

public record GetIncidentsQuery() : IRequest<List<IncidentDto>>;

public record IncidentDto(Guid Id, Guid TripId, string Description, string Severity, DateTime ReportedAt);

public class GetIncidentsQueryHandler : IRequestHandler<GetIncidentsQuery, List<IncidentDto>>
{
    private readonly IAppDbContext _context;

    public GetIncidentsQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<IncidentDto>> Handle(GetIncidentsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Incidents
            .Select(i => new IncidentDto(i.Id, i.TripId, i.Description, i.Severity, i.ReportedAt))
            .ToListAsync(cancellationToken);
    }
}

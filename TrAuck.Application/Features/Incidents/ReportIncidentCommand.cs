using MediatR;
using TrAuckDomain.Aggregates.TripAggregate;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Incidents;

public record ReportIncidentCommand(Guid TripId, string Description, string Severity) : IRequest<Guid>;

public class ReportIncidentCommandHandler : IRequestHandler<ReportIncidentCommand, Guid>
{
    private readonly IAppDbContext _context;

    public ReportIncidentCommandHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(ReportIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = new Incident
        {
            TripId = request.TripId,
            Description = request.Description,
            Severity = request.Severity,
            ReportedAt = DateTime.UtcNow
        };

        _context.Incidents.Add(incident);
        await _context.SaveChangesAsync(cancellationToken);

        return incident.Id;
    }
}

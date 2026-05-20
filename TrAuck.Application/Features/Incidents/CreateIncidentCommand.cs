using MediatR;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.TripAggregate;

namespace TrAuckApplication.Features.Incidents;

public class CreateIncidentCommand : IRequest<Incident>
{
    public Guid TripId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = "Low";
}

public class CreateIncidentCommandHandler : IRequestHandler<CreateIncidentCommand, Incident>
{
    private readonly IApplicationDbContext _context;

    public CreateIncidentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Incident> Handle(CreateIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            TripId = request.TripId,
            Description = request.Description,
            Severity = request.Severity,
            ReportedAt = DateTime.UtcNow
        };

        _context.Incidents.Add(incident);
        await _context.SaveChangesAsync(cancellationToken);

        return incident;
    }
}

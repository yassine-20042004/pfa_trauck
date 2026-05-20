using MediatR;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.LoadAggregate;

namespace TrAuckApplication.Features.LoadPlans;

public class CreateLoadPlanCommand : IRequest<LoadPlan>
{
    public Guid TripId { get; set; }
    public string Description { get; set; } = string.Empty;
    public double TotalWeight { get; set; }
}

public class CreateLoadPlanCommandHandler : IRequestHandler<CreateLoadPlanCommand, LoadPlan>
{
    private readonly IApplicationDbContext _context;

    public CreateLoadPlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LoadPlan> Handle(CreateLoadPlanCommand request, CancellationToken cancellationToken)
    {
        var loadPlan = new LoadPlan
        {
            Id = Guid.NewGuid(),
            TripId = request.TripId,
            Description = request.Description,
            TotalWeight = request.TotalWeight,
            CreatedAt = DateTime.UtcNow
        };

        _context.LoadPlans.Add(loadPlan);
        await _context.SaveChangesAsync(cancellationToken);

        return loadPlan;
    }
}

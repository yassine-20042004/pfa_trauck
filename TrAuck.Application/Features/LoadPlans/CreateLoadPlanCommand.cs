using MediatR;
using TrAuckDomain.Aggregates.LoadAggregate;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.LoadPlans;

public record CreateLoadPlanCommand(Guid TripId, double TotalWeight, string Description) : IRequest<Guid>;

public class CreateLoadPlanCommandHandler : IRequestHandler<CreateLoadPlanCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateLoadPlanCommandHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateLoadPlanCommand request, CancellationToken cancellationToken)
    {
        var loadPlan = new LoadPlan
        {
            TripId = request.TripId,
            TotalWeight = request.TotalWeight,
            Description = request.Description
        };

        _context.LoadPlans.Add(loadPlan);
        await _context.SaveChangesAsync(cancellationToken);

        return loadPlan.Id;
    }
}

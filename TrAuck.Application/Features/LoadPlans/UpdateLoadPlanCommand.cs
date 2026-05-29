using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.LoadAggregate;

namespace TrAuckApplication.Features.LoadPlans;

public class UpdateLoadPlanCommand : IRequest<LoadPlan?>
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string Description { get; set; } = string.Empty;
    public double TotalWeight { get; set; }
}

public class UpdateLoadPlanCommandHandler : IRequestHandler<UpdateLoadPlanCommand, LoadPlan?>
{
    private readonly IApplicationDbContext _context;

    public UpdateLoadPlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LoadPlan?> Handle(UpdateLoadPlanCommand request, CancellationToken cancellationToken)
    {
        var loadPlan = await _context.LoadPlans.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (loadPlan == null)
        {
            return null;
        }

        loadPlan.TripId = request.TripId;
        loadPlan.Description = request.Description;
        loadPlan.TotalWeight = request.TotalWeight;

        await _context.SaveChangesAsync(cancellationToken);

        return loadPlan;
    }
}

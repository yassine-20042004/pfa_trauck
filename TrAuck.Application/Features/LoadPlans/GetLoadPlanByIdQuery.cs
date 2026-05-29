using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.LoadAggregate;

namespace TrAuckApplication.Features.LoadPlans;

public class GetLoadPlanByIdQuery : IRequest<LoadPlan?>
{
    public Guid Id { get; set; }
}

public class GetLoadPlanByIdQueryHandler : IRequestHandler<GetLoadPlanByIdQuery, LoadPlan?>
{
    private readonly IApplicationDbContext _context;

    public GetLoadPlanByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LoadPlan?> Handle(GetLoadPlanByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.LoadPlans.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.LoadAggregate;

namespace TrAuckApplication.Features.LoadPlans;

public class GetLoadPlansQuery : IRequest<List<LoadPlan>>
{
}

public class GetLoadPlansQueryHandler : IRequestHandler<GetLoadPlansQuery, List<LoadPlan>>
{
    private readonly IApplicationDbContext _context;

    public GetLoadPlansQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LoadPlan>> Handle(GetLoadPlansQuery request, CancellationToken cancellationToken)
    {
        return await _context.LoadPlans.ToListAsync(cancellationToken);
    }
}

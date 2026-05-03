using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckDomain.Aggregates.LoadAggregate;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.LoadPlans;

public record GetLoadPlansQuery() : IRequest<List<LoadPlanDto>>;

public record LoadPlanDto(Guid Id, Guid TripId, double TotalWeight, string Description);

public class GetLoadPlansQueryHandler : IRequestHandler<GetLoadPlansQuery, List<LoadPlanDto>>
{
    private readonly IAppDbContext _context;

    public GetLoadPlansQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<LoadPlanDto>> Handle(GetLoadPlansQuery request, CancellationToken cancellationToken)
    {
        return await _context.LoadPlans
            .Select(l => new LoadPlanDto(l.Id, l.TripId, l.TotalWeight, l.Description))
            .ToListAsync(cancellationToken);
    }
}

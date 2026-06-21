using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.LoadPlans;

public class DeleteLoadPlanCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteLoadPlanCommandHandler : IRequestHandler<DeleteLoadPlanCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteLoadPlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteLoadPlanCommand request, CancellationToken cancellationToken)
    {
        var loadPlan = await _context.LoadPlans.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (loadPlan == null)
        {
            return false;
        }

        _context.LoadPlans.Remove(loadPlan);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

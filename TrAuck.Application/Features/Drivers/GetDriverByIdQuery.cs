using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.FleetAggregate;

namespace TrAuckApplication.Features.Drivers;

public class GetDriverByIdQuery : IRequest<Driver?>
{
    public Guid Id { get; set; }
}

public class GetDriverByIdQueryHandler : IRequestHandler<GetDriverByIdQuery, Driver?>
{
    private readonly IApplicationDbContext _context;

    public GetDriverByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Driver?> Handle(GetDriverByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Drivers.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
    }
}

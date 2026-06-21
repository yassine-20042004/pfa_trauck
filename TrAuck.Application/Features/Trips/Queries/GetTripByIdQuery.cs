using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.TripAggregate;

namespace TrAuckApplication.Features.Trips.Queries;

public class GetTripByIdQuery : IRequest<Trip?>
{
    public Guid Id { get; set; }
}

public class GetTripByIdQueryHandler : IRequestHandler<GetTripByIdQuery, Trip?>
{
    private readonly IApplicationDbContext _context;

    public GetTripByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Trip?> Handle(GetTripByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Trips.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckDomain.Aggregates.FleetAggregate;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Drivers;

public record GetDriversQuery() : IRequest<List<DriverDto>>;

public record DriverDto(Guid Id, string FirstName, string LastName, string LicenseNumber, bool IsAvailable);

public class GetDriversQueryHandler : IRequestHandler<GetDriversQuery, List<DriverDto>>
{
    private readonly IAppDbContext _context;

    public GetDriversQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<DriverDto>> Handle(GetDriversQuery request, CancellationToken cancellationToken)
    {
        return await _context.Drivers
            .Select(d => new DriverDto(d.Id, d.FirstName, d.LastName, d.LicenseNumber, d.IsAvailable))
            .ToListAsync(cancellationToken);
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.FleetAggregate;

namespace TrAuckApplication.Features.Drivers;

public class UpdateDriverCommand : IRequest<Driver?>
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public double Rating { get; set; }
}

public class UpdateDriverCommandHandler : IRequestHandler<UpdateDriverCommand, Driver?>
{
    private readonly IApplicationDbContext _context;

    public UpdateDriverCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Driver?> Handle(UpdateDriverCommand request, CancellationToken cancellationToken)
    {
        var driver = await _context.Drivers.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (driver == null)
        {
            return null;
        }

        driver.FirstName = request.FirstName;
        driver.LastName = request.LastName;
        driver.LicenseNumber = request.LicenseNumber;
        driver.Phone = request.Phone;
        driver.IsAvailable = request.IsAvailable;
        driver.Rating = request.Rating;

        await _context.SaveChangesAsync(cancellationToken);

        return driver;
    }
}

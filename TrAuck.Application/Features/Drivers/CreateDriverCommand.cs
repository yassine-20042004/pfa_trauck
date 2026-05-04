using MediatR;
using TrAuckDomain.Aggregates.FleetAggregate;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Drivers;

public record CreateDriverCommand(string FirstName, string LastName, string LicenseNumber) : IRequest<Guid>;

public class CreateDriverCommandHandler : IRequestHandler<CreateDriverCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateDriverCommandHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateDriverCommand request, CancellationToken cancellationToken)
    {
        var driver = new Driver
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            LicenseNumber = request.LicenseNumber,
            IsAvailable = true
        };

        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync(cancellationToken);

        return driver.Id;
    }
}

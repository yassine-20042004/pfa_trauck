using MediatR;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.FleetAggregate;

namespace TrAuckApplication.Features.Drivers;

public class CreateDriverCommand : IRequest<Driver>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    // UserId is optional in the UI — defaults to Guid.Empty until driver onboarding
    // is linked to user registration.
    public Guid UserId { get; set; } = Guid.Empty;
}

public class CreateDriverCommandHandler : IRequestHandler<CreateDriverCommand, Driver>
{
    private readonly IApplicationDbContext _context;

    public CreateDriverCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Driver> Handle(CreateDriverCommand request, CancellationToken cancellationToken)
    {
        var driver = new Driver
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            LicenseNumber = request.LicenseNumber,
            Phone = request.Phone,
            IsAvailable = true,
            Rating = 5.0
        };

        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync(cancellationToken);

        return driver;
    }
}

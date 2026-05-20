using MediatR;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.TripAggregate;

namespace TrAuckApplication.Features.Trips.Commands;

public class CreateTripCommand : IRequest<Trip>
{
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }
}

public class CreateTripCommandHandler : IRequestHandler<CreateTripCommand, Trip>
{
    private readonly IApplicationDbContext _context;

    public CreateTripCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Trip> Handle(CreateTripCommand request, CancellationToken cancellationToken)
    {
        var trip = new Trip
        {
            Id = Guid.NewGuid(),
            Origin = request.Origin,
            Destination = request.Destination,
            DriverId = request.DriverId,
            VehicleId = request.VehicleId,
            Status = "Planned",
            DepartedAt = null,
            CreatedAt = DateTime.UtcNow
        };

        _context.Trips.Add(trip);
        await _context.SaveChangesAsync(cancellationToken);

        return trip;
    }
}


using MediatR;
using TrAuckDomain.Aggregates.TripAggregate;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Trips;

public record CreateTripCommand(string Origin, string Destination, Guid DriverId, Guid VehicleId) : IRequest<Guid>;

public class CreateTripCommandHandler : IRequestHandler<CreateTripCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateTripCommandHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateTripCommand request, CancellationToken cancellationToken)
    {
        var trip = new Trip
        {
            Origin = request.Origin,
            Destination = request.Destination,
            DriverId = request.DriverId,
            VehicleId = request.VehicleId,
            Status = "Pending"
        };

        _context.Trips.Add(trip);
        await _context.SaveChangesAsync(cancellationToken);

        return trip.Id;
    }
}

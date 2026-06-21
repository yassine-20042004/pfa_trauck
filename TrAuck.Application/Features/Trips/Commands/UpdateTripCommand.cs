using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.TripAggregate;

namespace TrAuckApplication.Features.Trips.Commands;

public class UpdateTripCommand : IRequest<Trip?>
{
    public Guid Id { get; set; }
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid DriverId { get; set; }
    public Guid VehicleId { get; set; }
    public DateTime? DepartedAt { get; set; }
    public double Distance { get; set; }
    public double Duration { get; set; }
    public string Winner { get; set; } = string.Empty;
    public string ZonesJson { get; set; } = "[]";
    public string CustomCoordsJson { get; set; } = "{}";
}

public class UpdateTripCommandHandler : IRequestHandler<UpdateTripCommand, Trip?>
{
    private readonly IApplicationDbContext _context;

    public UpdateTripCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Trip?> Handle(UpdateTripCommand request, CancellationToken cancellationToken)
    {
        var trip = await _context.Trips.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (trip == null)
        {
            return null;
        }

        trip.Origin = request.Origin;
        trip.Destination = request.Destination;
        trip.Status = request.Status;
        trip.DriverId = request.DriverId;
        trip.VehicleId = request.VehicleId;
        trip.DepartedAt = request.DepartedAt;
        trip.Distance = request.Distance;
        trip.Duration = request.Duration;
        trip.Winner = request.Winner;
        trip.ZonesJson = request.ZonesJson;
        trip.CustomCoordsJson = request.CustomCoordsJson;

        await _context.SaveChangesAsync(cancellationToken);

        return trip;
    }
}

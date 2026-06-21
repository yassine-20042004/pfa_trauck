using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.FleetAggregate;

namespace TrAuckApplication.Features.Vehicles;

public class UpdateVehicleCommand : IRequest<Vehicle?>
{
    public Guid Id { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string PlateNumber { get; set; } = string.Empty;
    public double CapacityTons { get; set; }
    public string Type { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class UpdateVehicleCommandHandler : IRequestHandler<UpdateVehicleCommand, Vehicle?>
{
    private readonly IApplicationDbContext _context;

    public UpdateVehicleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Vehicle?> Handle(UpdateVehicleCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (vehicle == null)
        {
            return null;
        }

        vehicle.Make = request.Make;
        vehicle.Model = request.Model;
        vehicle.PlateNumber = request.PlateNumber;
        vehicle.CapacityTons = request.CapacityTons;
        vehicle.Type = request.Type;
        vehicle.Year = request.Year;
        vehicle.Status = request.Status;

        await _context.SaveChangesAsync(cancellationToken);

        return vehicle;
    }
}

using MediatR;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.FleetAggregate;

namespace TrAuckApplication.Features.Vehicles;

public class CreateVehicleCommand : IRequest<Vehicle>
{
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string PlateNumber { get; set; } = string.Empty;
    public double CapacityTons { get; set; }
    public string Type { get; set; } = "CargoVan";
    public int Year { get; set; } = DateTime.UtcNow.Year;
    public string Status { get; set; } = "Available";
}

public class CreateVehicleCommandHandler : IRequestHandler<CreateVehicleCommand, Vehicle>
{
    private readonly IApplicationDbContext _context;

    public CreateVehicleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Vehicle> Handle(CreateVehicleCommand request, CancellationToken cancellationToken)
    {
        var vehicle = new Vehicle
        {
            Id = Guid.NewGuid(),
            Make = request.Make,
            Model = request.Model,
            PlateNumber = request.PlateNumber,
            CapacityTons = request.CapacityTons,
            Type = request.Type,
            Year = request.Year,
            Status = request.Status
        };

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync(cancellationToken);

        return vehicle;
    }
}

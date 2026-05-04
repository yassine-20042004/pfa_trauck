using MediatR;
using TrAuckDomain.Aggregates.FleetAggregate;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Vehicles;

public record CreateVehicleCommand(string Make, string Model, string LicensePlate, double Capacity) : IRequest<Guid>;

public class CreateVehicleCommandHandler : IRequestHandler<CreateVehicleCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateVehicleCommandHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateVehicleCommand request, CancellationToken cancellationToken)
    {
        var vehicle = new Vehicle
        {
            Make = request.Make,
            Model = request.Model,
            LicensePlate = request.LicensePlate,
            Capacity = request.Capacity
        };

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync(cancellationToken);

        return vehicle.Id;
    }
}

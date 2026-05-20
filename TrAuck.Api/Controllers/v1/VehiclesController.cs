using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrAuckApplication.Features.Vehicles;

namespace TrAuckApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IMediator _mediator;

    public VehiclesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var vehicles = await _mediator.Send(new GetVehiclesQuery(), cancellationToken);
        return Ok(vehicles);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateVehicleDto dto, CancellationToken cancellationToken)
    {
        var command = new CreateVehicleCommand
        {
            Make = dto.Make ?? string.Empty,
            Model = dto.Model ?? string.Empty,
            // Map frontend "licensePlate"/"capacity" fields to domain names
            PlateNumber = dto.LicensePlate ?? dto.PlateNumber ?? string.Empty,
            CapacityTons = dto.Capacity > 0 ? dto.Capacity : dto.CapacityTons,
            Type = dto.Type ?? "CargoVan",
            Year = dto.Year > 0 ? dto.Year : DateTime.UtcNow.Year,
            Status = dto.Status ?? "Available"
        };

        var vehicle = await _mediator.Send(command, cancellationToken);
        return Created($"/api/v1/vehicles/{vehicle.Id}", vehicle);
    }
}

// Flexible DTO accepts both camelCase frontend names and domain names
public class CreateVehicleDto
{
    public string? Make { get; set; }
    public string? Model { get; set; }
    // Frontend sends "licensePlate"; domain uses "PlateNumber"
    public string? LicensePlate { get; set; }
    public string? PlateNumber { get; set; }
    // Frontend sends "capacity"; domain uses "CapacityTons"
    public double Capacity { get; set; }
    public double CapacityTons { get; set; }
    public string? Type { get; set; }
    public int Year { get; set; }
    public string? Status { get; set; }
}

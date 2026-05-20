using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrAuckApplication.Features.Trips.Commands;
using TrAuckApplication.Features.Trips.Queries;

namespace TrAuckApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class TripsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TripsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var trips = await _mediator.Send(new GetTripsQuery(), cancellationToken);
        return Ok(trips);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateTripDto dto, CancellationToken cancellationToken)
    {
        // Accept both string and Guid for driverId/vehicleId (frontend sends strings)
        Guid.TryParse(dto.DriverId, out var driverGuid);
        Guid.TryParse(dto.VehicleId, out var vehicleGuid);

        var command = new CreateTripCommand
        {
            Origin = dto.Origin ?? string.Empty,
            Destination = dto.Destination ?? string.Empty,
            DriverId = driverGuid,
            VehicleId = vehicleGuid
        };

        var trip = await _mediator.Send(command, cancellationToken);
        return Created($"/api/v1/trips/{trip.Id}", trip);
    }
}

public class CreateTripDto
{
    public string? Origin { get; set; }
    public string? Destination { get; set; }
    public string? DriverId { get; set; }
    public string? VehicleId { get; set; }
}

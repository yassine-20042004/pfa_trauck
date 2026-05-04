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

    [HttpPost]
    public async Task<IActionResult> CreateVehicle([FromBody] CreateVehicleCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetVehicles), new { id = result }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetVehicles()
    {
        var result = await _mediator.Send(new GetVehiclesQuery());
        return Ok(result);
    }
}


using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrAuckApplication.Features.Trips;

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

    [HttpPost]
    public async Task<IActionResult> CreateTrip([FromBody] CreateTripCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetTrips), new { id = result }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetTrips()
    {
        var result = await _mediator.Send(new GetTripsQuery());
        return Ok(result);
    }
}


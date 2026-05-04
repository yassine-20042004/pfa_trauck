using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrAuckApplication.Features.Drivers;

namespace TrAuckApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class DriversController : ControllerBase
{
    private readonly IMediator _mediator;

    public DriversController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateDriver([FromBody] CreateDriverCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetDrivers), new { id = result }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetDrivers()
    {
        var result = await _mediator.Send(new GetDriversQuery());
        return Ok(result);
    }
}


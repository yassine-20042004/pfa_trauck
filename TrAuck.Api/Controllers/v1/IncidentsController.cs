using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrAuckApplication.Features.Incidents;

namespace TrAuckApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class IncidentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public IncidentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> ReportIncident([FromBody] ReportIncidentCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetIncidents), new { id = result }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetIncidents()
    {
        var result = await _mediator.Send(new GetIncidentsQuery());
        return Ok(result);
    }
}

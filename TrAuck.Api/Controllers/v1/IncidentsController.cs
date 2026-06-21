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

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var incidents = await _mediator.Send(new GetIncidentsQuery(), cancellationToken);
        return Ok(incidents);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateIncidentDto dto, CancellationToken cancellationToken)
    {
        // Accept both string and Guid for tripId
        Guid.TryParse(dto.TripId, out var tripGuid);

        var command = new CreateIncidentCommand
        {
            TripId = tripGuid,
            Description = dto.Description ?? string.Empty,
            Severity = dto.Severity ?? "Low"
        };

        var incident = await _mediator.Send(command, cancellationToken);
        return Created($"/api/v1/incidents/{incident.Id}", incident);
    }
}

public class CreateIncidentDto
{
    public string? TripId { get; set; }
    public string? Description { get; set; }
    public string? Severity { get; set; }
}

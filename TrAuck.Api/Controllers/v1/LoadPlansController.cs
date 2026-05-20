using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrAuckApplication.Features.LoadPlans;

namespace TrAuckApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class LoadPlansController : ControllerBase
{
    private readonly IMediator _mediator;

    public LoadPlansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var loadPlans = await _mediator.Send(new GetLoadPlansQuery(), cancellationToken);
        return Ok(loadPlans);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateLoadPlanDto dto, CancellationToken cancellationToken)
    {
        // Accept both string and Guid for tripId
        Guid.TryParse(dto.TripId, out var tripGuid);

        var command = new CreateLoadPlanCommand
        {
            TripId = tripGuid,
            Description = dto.Description ?? string.Empty,
            TotalWeight = dto.TotalWeight
        };

        var loadPlan = await _mediator.Send(command, cancellationToken);
        return Created($"/api/v1/loadplans/{loadPlan.Id}", loadPlan);
    }
}

public class CreateLoadPlanDto
{
    public string? TripId { get; set; }
    public string? Description { get; set; }
    public double TotalWeight { get; set; }
}

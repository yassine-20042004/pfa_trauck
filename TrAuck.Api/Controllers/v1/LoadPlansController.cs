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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var loadPlan = await _mediator.Send(new GetLoadPlanByIdQuery { Id = id }, cancellationToken);
        if (loadPlan == null)
            return NotFound();
        return Ok(loadPlan);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(Guid id, [FromBody] UpdateLoadPlanCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest("Id in route does not match Id in body");

        var loadPlan = await _mediator.Send(command, cancellationToken);
        if (loadPlan == null)
            return NotFound();
        return Ok(loadPlan);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteLoadPlanCommand { Id = id }, cancellationToken);
        if (!result)
            return NotFound();
        return NoContent();
    }
}

public class CreateLoadPlanDto
{
    public string? TripId { get; set; }
    public string? Description { get; set; }
    public double TotalWeight { get; set; }
}

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

    [HttpPost]
    public async Task<IActionResult> CreateLoadPlan([FromBody] CreateLoadPlanCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetLoadPlans), new { id = result }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetLoadPlans()
    {
        var result = await _mediator.Send(new GetLoadPlansQuery());
        return Ok(result);
    }
}


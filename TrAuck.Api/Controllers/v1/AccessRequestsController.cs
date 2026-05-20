using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using TrAuckApplication.Features.Identity;

namespace TrAuckApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class AccessRequestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccessRequestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    public async Task<IActionResult> CreateAccessRequest([FromBody] CreateAccessRequestCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { Id = id });
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var requests = await _mediator.Send(new GetPendingAccessRequestsQuery());
        return Ok(requests);
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveRequest(Guid id)
    {
        var result = await _mediator.Send(new ApproveAccessRequestCommand { RequestId = id });
        if (!result) return NotFound("Request not found or already approved.");
        
        return Ok(new { Message = "User approved and account created successfully." });
    }
}

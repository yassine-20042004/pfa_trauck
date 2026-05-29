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

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var drivers = await _mediator.Send(new GetDriversQuery(), cancellationToken);
        return Ok(drivers);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateDriverDto dto, CancellationToken cancellationToken)
    {
        var command = new CreateDriverCommand
        {
            FirstName = dto.FirstName ?? string.Empty,
            LastName = dto.LastName ?? string.Empty,
            LicenseNumber = dto.LicenseNumber ?? string.Empty,
            Phone = dto.Phone ?? string.Empty,
            UserId = dto.UserId
        };

        var driver = await _mediator.Send(command, cancellationToken);
        return Created($"/api/v1/drivers/{driver.Id}", driver);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var driver = await _mediator.Send(new GetDriverByIdQuery { Id = id }, cancellationToken);
        if (driver == null)
            return NotFound();
        return Ok(driver);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(Guid id, [FromBody] UpdateDriverCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest("Id in route does not match Id in body");

        var driver = await _mediator.Send(command, cancellationToken);
        if (driver == null)
            return NotFound();
        return Ok(driver);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteDriverCommand { Id = id }, cancellationToken);
        if (!result)
            return NotFound();
        return NoContent();
    }
}

public class CreateDriverDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? LicenseNumber { get; set; }
    public string? Phone { get; set; }
    public Guid UserId { get; set; } = Guid.Empty;
}

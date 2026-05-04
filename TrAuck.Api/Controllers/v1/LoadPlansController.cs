using Microsoft.AspNetCore.Mvc;

namespace TrAuckApi.Controllers.v1;

public class LoadPlanDto {
    public string? tripId { get; set; }
    public string? description { get; set; }
    public double totalWeight { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
public class LoadPlansController : ControllerBase
{
    private static readonly List<object> _loadPlans = new List<object>
    {
        new { id = "1", tripId = "1", description = "Medical Supplies for Tangier Port", totalWeight = 500.0 },
        new { id = "2", tripId = "2", description = "Electronics Batch A", totalWeight = 1200.0 }
    };

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(_loadPlans);
    }

    [HttpPost]
    public IActionResult Post([FromBody] LoadPlanDto loadPlan)
    {
        var planObj = new { 
            id = Guid.NewGuid().ToString(),
            tripId = loadPlan.tripId,
            description = loadPlan.description,
            totalWeight = loadPlan.totalWeight
        };
        _loadPlans.Add(planObj);
        return Created("", planObj);
    }
}

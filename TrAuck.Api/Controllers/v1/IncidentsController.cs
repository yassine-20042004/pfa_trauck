using Microsoft.AspNetCore.Mvc;

namespace TrAuckApi.Controllers.v1;

public class IncidentDto {
    public string? tripId { get; set; }
    public string? description { get; set; }
    public string? severity { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
public class IncidentsController : ControllerBase
{
    private static readonly List<object> _incidents = new List<object>
    {
        new { id = "1", tripId = "1", description = "Heavy traffic at Checkpoint A", reportedAt = DateTime.UtcNow.ToString("o"), severity = "Low" },
        new { id = "2", tripId = "2", description = "Engine overheat detected", reportedAt = DateTime.UtcNow.ToString("o"), severity = "High" }
    };

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(_incidents);
    }

    [HttpPost]
    public IActionResult Post([FromBody] IncidentDto incident)
    {
        var incidentObj = new { 
            id = Guid.NewGuid().ToString(),
            tripId = incident.tripId,
            description = incident.description,
            reportedAt = DateTime.UtcNow.ToString("o"),
            severity = incident.severity
        };
        _incidents.Add(incidentObj);
        return Created("", incidentObj);
    }
}

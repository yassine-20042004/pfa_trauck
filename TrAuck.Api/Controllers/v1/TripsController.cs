using Microsoft.AspNetCore.Mvc;

namespace TrAuckApi.Controllers.v1;

public class TripDto {
    public string? origin { get; set; }
    public string? destination { get; set; }
    public string? driverId { get; set; }
    public string? vehicleId { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
public class TripsController : ControllerBase
{
    private static readonly List<object> _trips = new List<object>
    {
        new { id = "1", origin = "Casablanca", destination = "Tangier", status = "Ongoing", driverId = "1", vehicleId = "1" },
        new { id = "2", origin = "Marrakech", destination = "Agadir", status = "Planned", driverId = "2", vehicleId = "2" }
    };

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(_trips);
    }

    [HttpPost]
    public IActionResult Post([FromBody] TripDto trip)
    {
        var tripObj = new { 
            id = Guid.NewGuid().ToString(),
            origin = trip.origin,
            destination = trip.destination,
            status = "Planned",
            driverId = trip.driverId,
            vehicleId = trip.vehicleId
        };
        _trips.Add(tripObj);
        return Created("", tripObj);
    }
}

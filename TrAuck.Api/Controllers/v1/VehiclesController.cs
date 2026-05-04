using Microsoft.AspNetCore.Mvc;

namespace TrAuckApi.Controllers.v1;

public class VehicleDto {
    public string? make { get; set; }
    public string? model { get; set; }
    public string? licensePlate { get; set; }
    public double capacity { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
public class VehiclesController : ControllerBase
{
    private static readonly List<object> _vehicles = new List<object>
    {
        new { id = "1", make = "Volvo", model = "FH16", licensePlate = "ABC-123", capacity = 40.0 },
        new { id = "2", make = "Mercedes", model = "Actros", licensePlate = "DEF-456", capacity = 35.0 }
    };

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(_vehicles);
    }

    [HttpPost]
    public IActionResult Post([FromBody] VehicleDto vehicle)
    {
        var vehicleObj = new { 
            id = Guid.NewGuid().ToString(),
            make = vehicle.make,
            model = vehicle.model,
            licensePlate = vehicle.licensePlate,
            capacity = vehicle.capacity
        };
        _vehicles.Add(vehicleObj);
        return Created("", vehicleObj);
    }
}

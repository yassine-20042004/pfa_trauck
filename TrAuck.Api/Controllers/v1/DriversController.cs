using Microsoft.AspNetCore.Mvc;

namespace TrAuckApi.Controllers.v1;

public class DriverDto {
    public string? firstName { get; set; }
    public string? lastName { get; set; }
    public string? licenseNumber { get; set; }
    public string? phone { get; set; }
}

[ApiController]
[Route("api/v1/[controller]")]
public class DriversController : ControllerBase
{
    private static readonly List<object> _drivers = new List<object>
    {
        new { id = "1", firstName = "Salah Eddine", lastName = "A.", licenseNumber = "LIC-001", isAvailable = true },
        new { id = "2", firstName = "Anas", lastName = "B.", licenseNumber = "LIC-002", isAvailable = false },
        new { id = "3", firstName = "Yassine", lastName = "J.", licenseNumber = "LIC-003", isAvailable = true }
    };

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(_drivers);
    }

    [HttpPost]
    public IActionResult Post([FromBody] DriverDto driver)
    {
        var driverObj = new { 
            id = Guid.NewGuid().ToString(),
            firstName = driver.firstName,
            lastName = driver.lastName,
            licenseNumber = driver.licenseNumber,
            phone = driver.phone ?? "+212 600 000000",
            rating = 5.0,
            isAvailable = true
        };
        _drivers.Add(driverObj);
        return Created("", driverObj);
    }
}

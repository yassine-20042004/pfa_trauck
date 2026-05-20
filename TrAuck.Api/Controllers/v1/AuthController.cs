using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckApplication.Features.Identity;

namespace TrAuckApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[Microsoft.AspNetCore.Authorization.AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public AuthController(IMediator mediator, IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _mediator = mediator;
        _context = context;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        try
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupCommand command)
    {
        try
        {
            var success = await _mediator.Send(command);
            return Ok(new { Message = "Inscription réussie." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    // Temporary endpoint to migrate plain-text passwords to BCrypt hashes
    [HttpPost("migrate-passwords")]
    public async Task<IActionResult> MigratePasswords()
    {
        var users = await _context.Users.ToListAsync();
        int migratedCount = 0;

        foreach (var user in users)
        {
            // If the password hash does not start with the BCrypt prefix "$2a$" or "$2b$", we assume it's plain text.
            if (!user.PasswordHash.StartsWith("$2a$") && !user.PasswordHash.StartsWith("$2b$") && !user.PasswordHash.StartsWith("$2y$"))
            {
                user.PasswordHash = _passwordHasher.HashPassword(user.PasswordHash);
                migratedCount++;
            }
        }

        if (migratedCount > 0)
        {
            await _context.SaveChangesAsync(CancellationToken.None);
        }

        return Ok(new { message = $"Migrated {migratedCount} passwords successfully." });
    }
}

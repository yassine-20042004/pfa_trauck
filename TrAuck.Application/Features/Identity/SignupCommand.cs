using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Identity;

public class SignupCommand : IRequest<bool>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "Driver";
}

public class SignupCommandHandler : IRequestHandler<SignupCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public SignupCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(SignupCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken);

        if (existingUser)
        {
            throw new InvalidOperationException("Cet email est déjà utilisé par un autre compte.");
        }

        var user = new TrAuckDomain.Aggregates.IdentityAggregate.User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

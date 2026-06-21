using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.FleetAggregate;
using TrAuckDomain.Aggregates.IdentityAggregate;

namespace TrAuckApplication.Features.Drivers;

public class CreateDriverCommand : IRequest<Driver>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Guid UserId { get; set; } = Guid.Empty;
}

public class CreateDriverCommandHandler : IRequestHandler<CreateDriverCommand, Driver>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public CreateDriverCommandHandler(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<Driver> Handle(CreateDriverCommand request, CancellationToken cancellationToken)
    {
        Guid userId = request.UserId;

        // If no UserId is provided, create a new User account for this driver
        if (userId == Guid.Empty && !string.IsNullOrEmpty(request.Email))
        {
            var existingUser = await _context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken);
            if (existingUser)
            {
                throw new Exception("A user with this email already exists.");
            }

            var passwordHash = _passwordHasher.HashPassword(!string.IsNullOrEmpty(request.Password) ? request.Password : "driver123");
            var user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = "Driver",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            userId = user.Id;
        }

        var driver = new Driver
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            LicenseNumber = request.LicenseNumber,
            Phone = request.Phone,
            IsAvailable = true,
            Rating = 5.0
        };

        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync(cancellationToken);

        return driver;
    }
}

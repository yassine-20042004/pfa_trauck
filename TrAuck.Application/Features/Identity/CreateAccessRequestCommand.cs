using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.IdentityAggregate;

namespace TrAuckApplication.Features.Identity;

public class CreateAccessRequestCommand : IRequest<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string RequestedRole { get; set; } = string.Empty;
    public string CompanyOrReason { get; set; } = string.Empty;
    public string? LicenseNumber { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? PreferredVehicle { get; set; }
}

public class CreateAccessRequestCommandHandler : IRequestHandler<CreateAccessRequestCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateAccessRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateAccessRequestCommand request, CancellationToken cancellationToken)
    {
        var entity = new AccessRequest
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RequestedRole = request.RequestedRole,
            CompanyOrReason = request.CompanyOrReason,
            LicenseNumber = request.LicenseNumber,
            YearsOfExperience = request.YearsOfExperience,
            PreferredVehicle = request.PreferredVehicle,
            RequestedAt = DateTime.UtcNow,
            Status = "Pending"
        };

        _context.AccessRequests.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}

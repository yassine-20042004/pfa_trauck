using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TrAuckApplication.Common.Interfaces;
using TrAuckDomain.Aggregates.IdentityAggregate;
using Microsoft.EntityFrameworkCore;

namespace TrAuckApplication.Features.Identity;

public class ApproveAccessRequestCommand : IRequest<bool>
{
    public Guid RequestId { get; set; }
}

public class ApproveAccessRequestCommandHandler : IRequestHandler<ApproveAccessRequestCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ApproveAccessRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ApproveAccessRequestCommand request, CancellationToken cancellationToken)
    {
        var accessRequest = await _context.AccessRequests
            .FirstOrDefaultAsync(x => x.Id == request.RequestId, cancellationToken);

        if (accessRequest == null || accessRequest.Status == "Approved")
        {
            return false;
        }

        // 1. Mark request as Approved
        accessRequest.Status = "Approved";

        // 2. Create the User
        var newUser = new User
        {
            Id = Guid.NewGuid(),
            FirstName = accessRequest.FirstName,
            LastName = accessRequest.LastName,
            Email = accessRequest.Email,
            Role = accessRequest.RequestedRole,
            PasswordHash = accessRequest.PasswordHash, // Transfer the hashed password
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);

        // 3. If it's a driver, create the Driver record
        if (newUser.Role.ToLower() == "driver")
        {
            var newDriver = new TrAuckDomain.Aggregates.FleetAggregate.Driver
            {
                Id = Guid.NewGuid(),
                UserId = newUser.Id,
                FirstName = newUser.FirstName,
                LastName = newUser.LastName,
                LicenseNumber = accessRequest.LicenseNumber ?? "PENDING",
                Phone = "Pending", // Or add to access request
                IsAvailable = true,
                Rating = 5.0
            };
            _context.Drivers.Add(newDriver);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

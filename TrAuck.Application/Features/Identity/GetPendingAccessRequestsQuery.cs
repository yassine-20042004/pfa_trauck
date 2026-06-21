using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Identity;

public class AccessRequestDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string RequestedRole { get; set; } = string.Empty;
    public string CompanyOrReason { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class GetPendingAccessRequestsQuery : IRequest<List<AccessRequestDto>>
{
}

public class GetPendingAccessRequestsQueryHandler : IRequestHandler<GetPendingAccessRequestsQuery, List<AccessRequestDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPendingAccessRequestsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AccessRequestDto>> Handle(GetPendingAccessRequestsQuery request, CancellationToken cancellationToken)
    {
        return await _context.AccessRequests
            .Where(x => x.Status == "Pending")
            .OrderByDescending(x => x.RequestedAt)
            .Select(x => new AccessRequestDto
            {
                Id = x.Id,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Email = x.Email,
                RequestedRole = x.RequestedRole,
                CompanyOrReason = x.CompanyOrReason,
                RequestedAt = x.RequestedAt,
                Status = x.Status
            })
            .ToListAsync(cancellationToken);
    }
}

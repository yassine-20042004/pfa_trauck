using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Trips.Commands;

public class DeleteTripCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteTripCommandHandler : IRequestHandler<DeleteTripCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteTripCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteTripCommand request, CancellationToken cancellationToken)
    {
        var trip = await _context.Trips.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (trip == null)
        {
            return false;
        }

        _context.Trips.Remove(trip);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

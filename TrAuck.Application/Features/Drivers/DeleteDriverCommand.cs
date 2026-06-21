using MediatR;
using Microsoft.EntityFrameworkCore;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApplication.Features.Drivers;

public class DeleteDriverCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}

public class DeleteDriverCommandHandler : IRequestHandler<DeleteDriverCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteDriverCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteDriverCommand request, CancellationToken cancellationToken)
    {
        var driver = await _context.Drivers.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (driver == null)
        {
            return false;
        }

        _context.Drivers.Remove(driver);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}

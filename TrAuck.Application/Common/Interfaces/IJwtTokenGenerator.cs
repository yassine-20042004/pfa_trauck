using TrAuckDomain.Aggregates.IdentityAggregate;

namespace TrAuckApplication.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}

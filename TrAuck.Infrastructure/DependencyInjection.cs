using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TrAuckInfrastructure.Persistence;

namespace TrAuckInfrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseInMemoryDatabase("TrAuckDb"));

        services.AddScoped<TrAuckApplication.Common.Interfaces.IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        return services;
    }
}

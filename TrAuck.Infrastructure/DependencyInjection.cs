using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TrAuckApplication.Common.Interfaces;
using TrAuckInfrastructure.Persistence;
using TrAuckInfrastructure.Services;

namespace TrAuckInfrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseInMemoryDatabase("TrAuckDb"));

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        // Algorithmes de routage (Dijkstra + GraphBuilder)
        services.AddSingleton<IAlgorithmService, AlgorithmService>();

        return services;
    }
}

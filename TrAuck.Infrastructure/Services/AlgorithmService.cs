using TrAuckApplication.Common.Interfaces;
using TrAuckInfrastructure.Services.Algorithms;

namespace TrAuckInfrastructure.Services;

/// <summary>
/// Implémentation du service d'algorithmes de routage.
/// Encapsule GraphBuilder + DijkstraAlgorithm pour injection via DI.
/// </summary>
public sealed class AlgorithmService : IAlgorithmService
{
    private readonly GraphBuilder _graph;
    private readonly DijkstraAlgorithm _dijkstra;

    public AlgorithmService()
    {
        // Charge le réseau routier par défaut
        _graph = GraphBuilder.BuildDefaultNetwork();
        _dijkstra = new DijkstraAlgorithm(_graph);
    }

    /// <inheritdoc/>
    public ShortestPathResult FindShortestPath(string sourceId, string destinationId,
                                               OptimizationMetric metric = OptimizationMetric.Distance)
        => _dijkstra.FindShortestPath(sourceId, destinationId, metric);

    /// <inheritdoc/>
    public Dictionary<string, ShortestPathResult> FindAllDeliveryPaths(string warehouseId,
                                                                        OptimizationMetric metric = OptimizationMetric.Distance)
        => _dijkstra.FindAllDeliveryPaths(warehouseId, metric);

    /// <inheritdoc/>
    public Dictionary<string, string> GetNodeNames()
        => _graph.GetNodes()
                 .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Name);
}

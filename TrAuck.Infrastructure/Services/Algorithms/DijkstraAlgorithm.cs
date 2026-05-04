using TrAuckApplication.Common.Interfaces;

namespace TrAuckInfrastructure.Services.Algorithms;

/// <summary>
/// Implémentation de l'algorithme de Dijkstra pour trouver le chemin le plus court
/// dans le réseau routier (conditions normales, sans incidents).
///
/// Complexité : O((V + E) log V) avec une priority queue.
/// </summary>
public sealed class DijkstraAlgorithm
{
    private readonly GraphBuilder _graph;

    public DijkstraAlgorithm(GraphBuilder graph)
    {
        _graph = graph ?? throw new ArgumentNullException(nameof(graph));
    }

    /// <summary>
    /// Calcule le chemin le plus court entre l'entrepôt (source) et un point de livraison (destination).
    /// </summary>
    /// <param name="sourceId">ID du nœud source (entrepôt)</param>
    /// <param name="destinationId">ID du nœud destination (point de livraison)</param>
    /// <param name="metric">Critère d'optimisation : Distance ou Durée</param>
    /// <returns>Le chemin optimal avec distance totale et durée totale.</returns>
    public ShortestPathResult FindShortestPath(
        string sourceId,
        string destinationId,
        OptimizationMetric metric = OptimizationMetric.Distance)
    {
        if (!_graph.ContainsNode(sourceId))
            throw new KeyNotFoundException($"Nœud source '{sourceId}' introuvable dans le graphe.");
        if (!_graph.ContainsNode(destinationId))
            throw new KeyNotFoundException($"Nœud destination '{destinationId}' introuvable dans le graphe.");
        if (sourceId == destinationId)
            return new ShortestPathResult(new[] { sourceId }, 0, 0);

        // ── Initialisation ──────────────────────────────────────────────
        var allNodes = _graph.GetNodes();

        // dist[nodeId] = coût minimal connu depuis la source
        var dist = new Dictionary<string, double>();

        // prev[nodeId] = nœud précédent sur le chemin optimal
        var prev = new Dictionary<string, string?>();

        // Distance totale en km et durée en minutes pour reconstruction finale
        var distKm  = new Dictionary<string, double>();
        var distMin = new Dictionary<string, double>();

        foreach (var nodeId in allNodes.Keys)
        {
            dist[nodeId]    = double.PositiveInfinity;
            distKm[nodeId]  = double.PositiveInfinity;
            distMin[nodeId] = double.PositiveInfinity;
            prev[nodeId]    = null;
        }

        dist[sourceId]    = 0;
        distKm[sourceId]  = 0;
        distMin[sourceId] = 0;

        // Priority queue : (coût, séquence, nodeId)
        // Simulée avec SortedSet pour garantir O(log n) extraction du minimum
        var priorityQueue = new SortedSet<(double Cost, int Seq, string NodeId)>(
            Comparer<(double Cost, int Seq, string NodeId)>.Create((a, b) =>
            {
                int c = a.Cost.CompareTo(b.Cost);
                return c != 0 ? c : a.Seq.CompareTo(b.Seq);
            })
        );

        int seq = 0;
        priorityQueue.Add((0, seq++, sourceId));

        var visited = new HashSet<string>();

        // ── Boucle principale Dijkstra ───────────────────────────────────
        while (priorityQueue.Count > 0)
        {
            var (currentCost, _, currentId) = priorityQueue.Min;
            priorityQueue.Remove(priorityQueue.Min);

            // Destination atteinte → on arrête (optimisation early-exit)
            if (currentId == destinationId)
                break;

            // Nœud déjà traité avec un coût optimal
            if (visited.Contains(currentId))
                continue;
            visited.Add(currentId);

            // Explorer les voisins
            foreach (var edge in _graph.GetNeighbors(currentId))
            {
                if (visited.Contains(edge.ToNodeId))
                    continue;

                // Coût de cette arête selon la métrique choisie
                double edgeCost = metric == OptimizationMetric.Distance
                    ? edge.DistanceKm
                    : edge.DurationMinutes;

                double newCost = currentCost + edgeCost;

                if (newCost < dist[edge.ToNodeId])
                {
                    dist[edge.ToNodeId]    = newCost;
                    distKm[edge.ToNodeId]  = distKm[currentId]  + edge.DistanceKm;
                    distMin[edge.ToNodeId] = distMin[currentId] + edge.DurationMinutes;
                    prev[edge.ToNodeId]    = currentId;

                    priorityQueue.Add((newCost, seq++, edge.ToNodeId));
                }
            }
        }

        // ── Reconstruction du chemin ─────────────────────────────────────
        if (double.IsPositiveInfinity(dist[destinationId]))
            return ShortestPathResult.Unreachable();

        var path = new List<string>();
        string? current = destinationId;

        while (current != null)
        {
            path.Add(current);
            prev.TryGetValue(current, out current);
        }

        path.Reverse();

        return new ShortestPathResult(
            path,
            Math.Round(distKm[destinationId], 2),
            Math.Round(distMin[destinationId], 1)
        );
    }

    /// <summary>
    /// Calcule les chemins les plus courts de l'entrepôt vers TOUS les points de livraison.
    /// </summary>
    public Dictionary<string, ShortestPathResult> FindAllDeliveryPaths(
        string warehouseId,
        OptimizationMetric metric = OptimizationMetric.Distance)
    {
        var results = new Dictionary<string, ShortestPathResult>();
        var deliveryNodes = _graph.GetNodes().Values
            .Where(n => n.IsDeliveryPoint);

        foreach (var node in deliveryNodes)
        {
            results[node.Id] = FindShortestPath(warehouseId, node.Id, metric);
        }

        return results;
    }
}

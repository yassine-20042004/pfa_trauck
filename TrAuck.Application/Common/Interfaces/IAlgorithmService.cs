namespace TrAuckApplication.Common.Interfaces;

/// <summary>
/// Résultat retourné par les algorithmes de routage.
/// Placé dans Application pour respecter la Clean Architecture
/// (Application ne dépend pas de Infrastructure).
/// </summary>
public sealed class ShortestPathResult
{
    /// <summary>Liste ordonnée des IDs de nœuds formant le chemin (source → destination).</summary>
    public IReadOnlyList<string> Path { get; }

    /// <summary>Distance totale du chemin en kilomètres.</summary>
    public double TotalDistanceKm { get; }

    /// <summary>Durée totale estimée du chemin en minutes (conditions normales).</summary>
    public double TotalDurationMinutes { get; }

    /// <summary>Indique si un chemin a été trouvé.</summary>
    public bool IsReachable => Path.Count > 0;

    public ShortestPathResult(IReadOnlyList<string> path, double totalDistanceKm, double totalDurationMinutes)
    {
        Path = path;
        TotalDistanceKm = totalDistanceKm;
        TotalDurationMinutes = totalDurationMinutes;
    }

    /// <summary>Résultat vide indiquant qu'aucun chemin n'est accessible.</summary>
    public static ShortestPathResult Unreachable() =>
        new(Array.Empty<string>(), double.PositiveInfinity, double.PositiveInfinity);

    public override string ToString()
    {
        if (!IsReachable) return "Aucun chemin trouvé.";
        return $"Chemin : {string.Join(" → ", Path)} | {TotalDistanceKm:F1} km | {TotalDurationMinutes:F0} min";
    }
}

/// <summary>
/// Critère d'optimisation pour les algorithmes de routage.
/// </summary>
public enum OptimizationMetric
{
    /// <summary>Minimise la distance totale en km.</summary>
    Distance,

    /// <summary>Minimise la durée totale en minutes (conditions normales).</summary>
    Duration
}

/// <summary>
/// Interface du service d'algorithmes de routage.
/// Définit le contrat pour calculer les chemins optimaux dans le réseau routier.
/// </summary>
public interface IAlgorithmService
{
    /// <summary>
    /// Calcule le chemin le plus court entre deux nœuds du réseau routier
    /// en utilisant l'algorithme de Dijkstra (conditions normales, sans incidents).
    /// </summary>
    /// <param name="sourceId">ID du nœud source (entrepôt)</param>
    /// <param name="destinationId">ID du nœud destination (point de livraison)</param>
    /// <param name="metric">Critère d'optimisation : Distance ou Durée</param>
    ShortestPathResult FindShortestPath(string sourceId, string destinationId,
                                        OptimizationMetric metric = OptimizationMetric.Distance);

    /// <summary>
    /// Calcule les chemins optimaux depuis l'entrepôt vers tous les points de livraison.
    /// </summary>
    /// <param name="warehouseId">ID de l'entrepôt</param>
    /// <param name="metric">Critère d'optimisation</param>
    Dictionary<string, ShortestPathResult> FindAllDeliveryPaths(string warehouseId,
                                                                  OptimizationMetric metric = OptimizationMetric.Distance);

    /// <summary>
    /// Retourne les noms lisibles des nœuds du graphe routier.
    /// Clé = ID du nœud, Valeur = nom du lieu.
    /// </summary>
    Dictionary<string, string> GetNodeNames();
}

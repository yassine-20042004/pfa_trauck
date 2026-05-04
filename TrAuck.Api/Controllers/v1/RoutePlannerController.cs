using Microsoft.AspNetCore.Mvc;
using TrAuckApplication.Common.Interfaces;

namespace TrAuckApi.Controllers.v1;

/// <summary>
/// Endpoint pour tester GraphBuilder + Dijkstra.
/// Permet de calculer le chemin le plus court dans le réseau routier.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class RoutePlannerController : ControllerBase
{
    private readonly IAlgorithmService _algorithmService;

    public RoutePlannerController(IAlgorithmService algorithmService)
    {
        _algorithmService = algorithmService;
    }

    /// <summary>
    /// Retourne tous les nœuds (lieux) du réseau routier.
    /// </summary>
    [HttpGet("nodes")]
    public IActionResult GetNodes()
    {
        var nodes = _algorithmService.GetNodeNames();
        return Ok(nodes);
    }

    /// <summary>
    /// Calcule le chemin le plus court entre deux lieux (Dijkstra).
    /// </summary>
    /// <param name="from">ID du nœud source (ex: CAS)</param>
    /// <param name="to">ID du nœud destination (ex: FES)</param>
    /// <param name="metric">Critère : Distance ou Duration (défaut: Distance)</param>
    [HttpGet("shortest-path")]
    public IActionResult GetShortestPath(
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] OptimizationMetric metric = OptimizationMetric.Distance)
    {
        if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to))
            return BadRequest("Les paramètres 'from' et 'to' sont obligatoires.");

        var result = _algorithmService.FindShortestPath(from, to, metric);

        if (!result.IsReachable)
            return NotFound(new { message = $"Aucun chemin trouvé entre '{from}' et '{to}'." });

        var nodeNames = _algorithmService.GetNodeNames();

        return Ok(new
        {
            from,
            to,
            metric       = metric.ToString(),
            totalDistanceKm     = result.TotalDistanceKm,
            totalDurationMinutes = result.TotalDurationMinutes,
            totalDurationHours   = Math.Round(result.TotalDurationMinutes / 60, 2),
            pathIds    = result.Path,
            pathNames  = result.Path.Select(id => nodeNames.TryGetValue(id, out var name) ? name : id).ToList()
        });
    }

    /// <summary>
    /// Calcule les chemins optimaux depuis l'entrepôt vers TOUS les points de livraison.
    /// </summary>
    /// <param name="warehouseId">ID de l'entrepôt (défaut: CAS = Casablanca)</param>
    /// <param name="metric">Critère : Distance ou Duration</param>
    [HttpGet("all-delivery-paths")]
    public IActionResult GetAllDeliveryPaths(
        [FromQuery] string warehouseId = "CAS",
        [FromQuery] OptimizationMetric metric = OptimizationMetric.Distance)
    {
        var results = _algorithmService.FindAllDeliveryPaths(warehouseId, metric);
        var nodeNames = _algorithmService.GetNodeNames();

        var response = results.Select(kvp => new
        {
            destinationId   = kvp.Key,
            destinationName = nodeNames.TryGetValue(kvp.Key, out var name) ? name : kvp.Key,
            isReachable     = kvp.Value.IsReachable,
            totalDistanceKm       = kvp.Value.TotalDistanceKm,
            totalDurationMinutes  = kvp.Value.TotalDurationMinutes,
            pathNames = kvp.Value.Path
                           .Select(id => nodeNames.TryGetValue(id, out var n) ? n : id)
                           .ToList()
        })
        .OrderBy(r => r.totalDistanceKm)
        .ToList();

        return Ok(new
        {
            warehouse = warehouseId,
            metric    = metric.ToString(),
            deliveries = response
        });
    }
}

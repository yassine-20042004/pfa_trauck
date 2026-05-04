using TrAuckDomain.ValueObjects;

namespace TrAuckInfrastructure.Services.Algorithms;

/// <summary>
/// Représente un nœud du réseau routier (un lieu géographique).
/// </summary>
public sealed class RoadNode
{
    public string Id { get; }
    public string Name { get; }
    public GeoCoordinate Location { get; }
    public bool IsWarehouse { get; }
    public bool IsDeliveryPoint { get; }

    public RoadNode(string id, string name, GeoCoordinate location,
                    bool isWarehouse = false, bool isDeliveryPoint = false)
    {
        Id = id;
        Name = name;
        Location = location;
        IsWarehouse = isWarehouse;
        IsDeliveryPoint = isDeliveryPoint;
    }

    public override string ToString() => $"{Name} [{Id}]";
}

/// <summary>
/// Représente une arête du graphe routier : la route entre deux lieux,
/// avec sa distance (km) et sa durée estimée (minutes).
/// </summary>
public sealed class RoadEdge
{
    public string FromNodeId { get; }
    public string ToNodeId { get; }
    public double DistanceKm { get; }
    public double DurationMinutes { get; }

    public RoadEdge(string fromNodeId, string toNodeId, double distanceKm, double durationMinutes)
    {
        if (distanceKm <= 0) throw new ArgumentException("La distance doit être positive.", nameof(distanceKm));
        if (durationMinutes <= 0) throw new ArgumentException("La durée doit être positive.", nameof(durationMinutes));

        FromNodeId = fromNodeId;
        ToNodeId = toNodeId;
        DistanceKm = distanceKm;
        DurationMinutes = durationMinutes;
    }

    public override string ToString() => $"{FromNodeId} → {ToNodeId} | {DistanceKm}km, {DurationMinutes}min";
}

/// <summary>
/// Construit et maintient le graphe représentant le réseau routier.
/// Nœuds = lieux (entrepôt, points de livraison, carrefours).
/// Arêtes = routes bidirectionnelles avec distance et durée.
/// </summary>
public sealed class GraphBuilder
{
    private readonly Dictionary<string, RoadNode> _nodes = new();
    private readonly Dictionary<string, List<RoadEdge>> _adjacencyList = new();

    // ──────────────────────────────────────────────
    // Construction du graphe
    // ──────────────────────────────────────────────

    /// <summary>Ajoute un lieu (nœud) au réseau routier.</summary>
    public GraphBuilder AddNode(RoadNode node)
    {
        if (_nodes.ContainsKey(node.Id))
            throw new InvalidOperationException($"Le nœud '{node.Id}' existe déjà dans le graphe.");

        _nodes[node.Id] = node;
        _adjacencyList[node.Id] = new List<RoadEdge>();
        return this;
    }

    /// <summary>
    /// Ajoute une route bidirectionnelle entre deux lieux.
    /// </summary>
    /// <param name="fromId">ID du nœud source</param>
    /// <param name="toId">ID du nœud destination</param>
    /// <param name="distanceKm">Distance en km</param>
    /// <param name="durationMinutes">Durée estimée en minutes (conditions normales)</param>
    public GraphBuilder AddEdge(string fromId, string toId, double distanceKm, double durationMinutes)
    {
        ValidateNodeExists(fromId);
        ValidateNodeExists(toId);

        // Route bidirectionnelle (non-orienté)
        _adjacencyList[fromId].Add(new RoadEdge(fromId, toId, distanceKm, durationMinutes));
        _adjacencyList[toId].Add(new RoadEdge(toId, fromId, distanceKm, durationMinutes));
        return this;
    }

    // ──────────────────────────────────────────────
    // Accesseurs
    // ──────────────────────────────────────────────

    /// <summary>Retourne un nœud par son ID.</summary>
    public RoadNode GetNode(string nodeId)
    {
        ValidateNodeExists(nodeId);
        return _nodes[nodeId];
    }

    /// <summary>Retourne tous les nœuds du graphe.</summary>
    public IReadOnlyDictionary<string, RoadNode> GetNodes() => _nodes;

    /// <summary>Retourne les voisins directs d'un nœud (arêtes sortantes).</summary>
    public IReadOnlyList<RoadEdge> GetNeighbors(string nodeId)
    {
        ValidateNodeExists(nodeId);
        return _adjacencyList[nodeId];
    }

    /// <summary>Retourne toutes les arêtes du graphe (sans doublons).</summary>
    public IEnumerable<RoadEdge> GetAllEdges()
    {
        var seen = new HashSet<string>();
        foreach (var edges in _adjacencyList.Values)
        {
            foreach (var edge in edges)
            {
                // Clé unique pour éviter les doublons A→B et B→A
                var key = string.Compare(edge.FromNodeId, edge.ToNodeId, StringComparison.Ordinal) < 0
                    ? $"{edge.FromNodeId}-{edge.ToNodeId}"
                    : $"{edge.ToNodeId}-{edge.FromNodeId}";

                if (seen.Add(key)) yield return edge;
            }
        }
    }

    /// <summary>Indique si un nœud existe dans le graphe.</summary>
    public bool ContainsNode(string nodeId) => _nodes.ContainsKey(nodeId);

    /// <summary>Nombre de nœuds dans le graphe.</summary>
    public int NodeCount => _nodes.Count;

    /// <summary>Nombre d'arêtes uniques dans le graphe.</summary>
    public int EdgeCount => GetAllEdges().Count();

    // ──────────────────────────────────────────────
    // Réseau par défaut
    // ──────────────────────────────────────────────

    /// <summary>
    /// Charge un réseau routier de démonstration avec des villes marocaines.
    /// Entrepôt principal : Casablanca.
    /// Points de livraison : Rabat, Marrakech, Fès, Agadir, Tanger.
    /// </summary>
    public static GraphBuilder BuildDefaultNetwork()
    {
        var graph = new GraphBuilder();

        // Nœuds (lieux)
        graph
            .AddNode(new RoadNode("CAS", "Casablanca",   new GeoCoordinate(33.5731, -7.5898),  isWarehouse: true))
            .AddNode(new RoadNode("RAB", "Rabat",        new GeoCoordinate(34.0209, -6.8416),  isDeliveryPoint: true))
            .AddNode(new RoadNode("FES", "Fès",          new GeoCoordinate(34.0181, -5.0078),  isDeliveryPoint: true))
            .AddNode(new RoadNode("MAR", "Marrakech",    new GeoCoordinate(31.6295, -7.9811),  isDeliveryPoint: true))
            .AddNode(new RoadNode("AGA", "Agadir",       new GeoCoordinate(30.4278, -9.5981),  isDeliveryPoint: true))
            .AddNode(new RoadNode("TAN", "Tanger",       new GeoCoordinate(35.7595, -5.8340),  isDeliveryPoint: true))
            .AddNode(new RoadNode("MKN", "Meknès",       new GeoCoordinate(33.8935, -5.5473)))  // Nœud intermédiaire
            .AddNode(new RoadNode("KEN", "Kénitra",      new GeoCoordinate(34.2610, -6.5802))); // Nœud intermédiaire

        // Arêtes (routes) — distance (km) | durée normale (min)
        graph
            .AddEdge("CAS", "RAB",  87,   70)   // Casablanca ↔ Rabat
            .AddEdge("CAS", "MAR", 238,  150)   // Casablanca ↔ Marrakech
            .AddEdge("RAB", "KEN",  47,   35)   // Rabat ↔ Kénitra
            .AddEdge("RAB", "MKN", 138,  100)   // Rabat ↔ Meknès
            .AddEdge("KEN", "TAN", 198,  140)   // Kénitra ↔ Tanger
            .AddEdge("MKN", "FES",  60,   45)   // Meknès ↔ Fès
            .AddEdge("MKN", "TAN", 220,  160)   // Meknès ↔ Tanger
            .AddEdge("MAR", "AGA", 253,  180)   // Marrakech ↔ Agadir
            .AddEdge("MAR", "MKN", 323,  230)   // Marrakech ↔ Meknès
            .AddEdge("FES",  "TAN", 328,  240);  // Fès ↔ Tanger

        return graph;
    }

    // ──────────────────────────────────────────────
    // Privé
    // ──────────────────────────────────────────────

    private void ValidateNodeExists(string nodeId)
    {
        if (!_nodes.ContainsKey(nodeId))
            throw new KeyNotFoundException($"Le nœud '{nodeId}' n'existe pas dans le graphe.");
    }
}

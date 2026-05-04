namespace TrAuckDomain.ValueObjects;

/// <summary>
/// Représente une coordonnée géographique (latitude/longitude) d'un lieu sur la carte.
/// </summary>
public sealed class GeoCoordinate
{
    public double Latitude { get; }
    public double Longitude { get; }

    public GeoCoordinate(double latitude, double longitude)
    {
        if (latitude < -90 || latitude > 90)
            throw new ArgumentOutOfRangeException(nameof(latitude), "La latitude doit être entre -90 et 90.");
        if (longitude < -180 || longitude > 180)
            throw new ArgumentOutOfRangeException(nameof(longitude), "La longitude doit être entre -180 et 180.");

        Latitude = latitude;
        Longitude = longitude;
    }

    /// <summary>
    /// Calcule la distance en km entre deux coordonnées via la formule de Haversine.
    /// </summary>
    public double DistanceTo(GeoCoordinate other)
    {
        const double R = 6371.0; // Rayon de la Terre en km
        var dLat = ToRad(other.Latitude - Latitude);
        var dLon = ToRad(other.Longitude - Longitude);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(ToRad(Latitude)) * Math.Cos(ToRad(other.Latitude))
              * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double degrees) => degrees * Math.PI / 180.0;

    public override string ToString() => $"({Latitude:F4}, {Longitude:F4})";

    public override bool Equals(object? obj) =>
        obj is GeoCoordinate other && Latitude == other.Latitude && Longitude == other.Longitude;

    public override int GetHashCode() => HashCode.Combine(Latitude, Longitude);
}

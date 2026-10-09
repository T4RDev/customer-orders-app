/**
 * Haversine formula to calculate the great-circle distance between two points
 * on a sphere from their longitudes and latitudes.
 *
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0; // Earth's mean radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180.0;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Filter items by radius in kilometers from a center coordinate
 *
 * @param items Array of items with lat/lon properties
 * @param centerLat Latitude of the center point
 * @param centerLng Longitude of the center point
 * @param maxRadiusKm Maximum distance in kilometers (e.g. 1.0 or 2.0)
 * @param latField Property name for latitude ('latitude' or 'delivery_latitude')
 * @param lngField Property name for longitude ('longitude' or 'delivery_longitude')
 * @returns Items within radius, sorted by distance ascending
 */
export function filterWithinRadius<T extends Record<string, any>>(
  items: T[],
  centerLat: number | string,
  centerLng: number | string,
  maxRadiusKm: number | string,
  latField: string = 'latitude',
  lngField: string = 'longitude'
): (T & { distance_km: number; distance_meters: number })[] {
  const cLat = typeof centerLat === 'string' ? parseFloat(centerLat) : centerLat;
  const cLng = typeof centerLng === 'string' ? parseFloat(centerLng) : centerLng;
  const maxRadius = typeof maxRadiusKm === 'string' ? parseFloat(maxRadiusKm) : maxRadiusKm;

  if (isNaN(cLat) || isNaN(cLng) || isNaN(maxRadius)) {
    throw new Error('Invalid coordinate or radius parameters');
  }

  const results: (T & { distance_km: number; distance_meters: number })[] = [];

  for (const item of items) {
    const itemLat = typeof item[latField] === 'string' ? parseFloat(item[latField]) : item[latField];
    const itemLng = typeof item[lngField] === 'string' ? parseFloat(item[lngField]) : item[lngField];

    if (isNaN(itemLat) || isNaN(itemLng)) continue;

    const distanceKm = calculateDistanceKm(cLat, cLng, itemLat, itemLng);

    if (distanceKm <= maxRadius) {
      results.push({
        ...item,
        distance_km: Math.round(distanceKm * 1000) / 1000,
        distance_meters: Math.round(distanceKm * 1000),
      });
    }
  }

  // Sort nearest first
  return results.sort((a, b) => a.distance_km - b.distance_km);
}

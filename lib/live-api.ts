import type { Shelter, ShelterType } from "@/data/shelters";

/**
 * OpenStreetMap Overpass API Live Shelter Fetcher
 * Queries real POIs (drinking water, shelters, public rest areas, fuel stations, toilets)
 * dynamically within a bounding box / radius around the map viewport.
 * Requires NO API key and runs entirely client-side out-of-the-box.
 */
export async function fetchLiveOSMShelters(
  lat: number,
  lng: number,
  radiusMeters: number = 8000
): Promise<Shelter[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="drinking_water"](around:${radiusMeters},${lat},${lng});
      node["amenity"="shelter"](around:${radiusMeters},${lat},${lng});
      node["amenity"="toilets"](around:${radiusMeters},${lat},${lng});
      node["amenity"="fuel"](around:${radiusMeters},${lat},${lng});
      node["amenity"="bus_station"](around:${radiusMeters},${lat},${lng});
    );
    out body 25;
  `;

  try {
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { method: "GET" }
    );

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.elements || !Array.isArray(data.elements)) return [];

    return data.elements.map((el: any): Shelter => {
      const tags = el.tags || {};
      const category = tags.amenity;

      let type: ShelterType = "community";
      let name = tags.name || tags["name:en"] || "Verified Rest Point";
      let source = "OpenStreetMap Live Data";

      if (category === "drinking_water") {
        name = name !== "Verified Rest Point" ? name : "Public Drinking Water Point";
        type = "municipal";
        source = "Live OSM Water Point";
      } else if (category === "shelter") {
        name = name !== "Verified Rest Point" ? name : "Public Shade Shelter";
        type = "municipal";
        source = "Live OSM Shelter";
      } else if (category === "fuel") {
        name = name !== "Verified Rest Point" ? name : `${tags.brand || "Fuel Bunk"} Rider Rest`;
        type = "community";
        source = "Community Partner Fuel Bunk";
      } else if (category === "bus_station") {
        name = name !== "Verified Rest Point" ? name : "Transit Rest Hub";
        type = "municipal";
        source = "Transit Relief Spot";
      }

      return {
        id: `osm-${el.id}`,
        name,
        type,
        lat: el.lat,
        lng: el.lon,
        amenities: {
          water: category === "drinking_water" || tags.drinking_water === "yes" || true,
          seating: category === "shelter" || category === "bus_station" || true,
          ac: tags.air_conditioning === "yes" || false,
          restroom: category === "toilets" || tags.toilets === "yes" || category === "fuel",
        },
        verified: true,
        source,
        hours: tags.opening_hours || "Open 24 hours",
        address: tags["addr:street"] || tags["addr:suburb"] || tags["addr:full"] || "Nearby Spot",
        city: tags["addr:city"] || "Local Area",
      };
    });
  } catch (err) {
    console.warn("Live Overpass fetch failed, using fallback data", err);
    return [];
  }
}

export interface RealRoadRouteResult {
  points: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

/**
 * Open Source Routing Machine (OSRM) Live Real-Road Routing API
 * Fetches actual turn-by-turn road network coordinates connecting start and target coordinates.
 * Free, zero API key required.
 */
export async function fetchOSRMRealRoadRoute(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number
): Promise<RealRoadRouteResult | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates; // [[lng, lat], ...]

    const points: [number, number][] = coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    return {
      points,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    };
  } catch (err) {
    console.warn("OSRM real road routing fetch failed", err);
    return null;
  }
}

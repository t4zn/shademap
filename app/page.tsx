"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { SHELTERS, DEFAULT_CENTER } from "@/data/shelters";
import type { Shelter } from "@/data/shelters";
import { haversineDistance, formatDistance } from "@/lib/utils";
import { FilterBar, type FilterType, type MapStyleType } from "@/components/filter-bar";
import { BottomSheet } from "@/components/bottom-sheet";
import { ShelterCard } from "@/components/shelter-card";
import { ShelterDetail } from "@/components/shelter-detail";
import { RouteComparison } from "@/components/route-comparison";
import { PartnerModal } from "@/components/partner-modal";
import { fetchLiveOSMShelters, fetchOSRMRealRoadRoute } from "@/lib/live-api";

import type { ActiveRoute } from "@/components/map-view";

// Dynamically import the map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#f8f9fa] flex items-center justify-center">
      <div className="text-sm text-muted animate-pulse">Loading ShadeMap…</div>
    </div>
  ),
});

export default function RootMapPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    DEFAULT_CENTER
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [viewCenter, setViewCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [liveOSMShelters, setLiveOSMShelters] = useState<Shelter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [mapStyle, setMapStyle] = useState<MapStyleType>("light");
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [directionsShelter, setDirectionsShelter] = useState<Shelter | null>(
    null
  );
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Center point for distance calculation
  const referencePoint = userLocation || viewCenter;

  // Live Overpass API fetch on location/viewport move
  useEffect(() => {
    let isMounted = true;
    fetchLiveOSMShelters(referencePoint[0], referencePoint[1], 10000).then((liveData) => {
      if (isMounted && liveData.length > 0) {
        setLiveOSMShelters(liveData);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [referencePoint[0], referencePoint[1]]);

  const handleCenterChange = useCallback((lat: number, lng: number) => {
    setViewCenter([lat, lng]);
  }, []);

  // Base shelters array sorted by proximity
  const allShelters = useMemo(() => {
    let combined = [...SHELTERS, ...liveOSMShelters];

    if (activeFilter !== "all") {
      combined = combined.filter((s) => s.type === activeFilter);
    }

    return combined
      .map((shelter) => ({
        ...shelter,
        distance: haversineDistance(
          referencePoint[0],
          referencePoint[1],
          shelter.lat,
          shelter.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [activeFilter, referencePoint, liveOSMShelters]);

  // Dedicated search results for the dropdown popover under top search bar, ranked by distance closest first
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allShelters
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      )
      .sort((a, b) => a.distance - b.distance);
  }, [searchQuery, allShelters]);

  // Nearby shelters within 20km for the bottom sheet list (always intact)
  const nearbyShelters = useMemo(() => {
    return allShelters.filter((shelter) => shelter.distance <= 20);
  }, [allShelters]);

  // Handle geolocation
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setUserLocation(DEFAULT_CENTER);
      setMapCenter(DEFAULT_CENTER);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(loc);
        setMapCenter(loc);
        setIsLocating(false);
      },
      () => {
        setUserLocation(DEFAULT_CENTER);
        setMapCenter(DEFAULT_CENTER);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  // Ask for browser geolocation permission automatically on initial load / first visit
  useEffect(() => {
    handleLocate();
  }, [handleLocate]);

  const handleShelterSelect = useCallback((shelter: Shelter) => {
    setSelectedShelter(null);
    setSelectedShelter(shelter);
    setMapCenter([shelter.lat, shelter.lng]);
  }, []);

  const handleGetDirections = useCallback((shelter: Shelter) => {
    setSelectedShelter(null);
    setDirectionsShelter(shelter);
  }, []);

  // In-app live routing generator with actual OSRM real-road geometry
  const handleStartInAppRouting = useCallback(
    async (shelter: Shelter) => {
      const start: [number, number] = userLocation || DEFAULT_CENTER;
      const destination: [number, number] = [shelter.lat, shelter.lng];

      // Fetch actual turn-by-turn road geometry from OSRM API
      const realRoute = await fetchOSRMRealRoadRoute(
        start[0],
        start[1],
        destination[0],
        destination[1]
      );

      let routePoints: [number, number][] = [];
      let etaMinutes = 5;
      let distanceKm = "1.5 km";

      if (realRoute && realRoute.points.length > 0) {
        routePoints = realRoute.points;
        etaMinutes = Math.max(2, Math.round(realRoute.durationSeconds / 60));
        distanceKm = formatDistance(realRoute.distanceMeters / 1000);
      } else {
        // Fallback smooth road curve waypoints
        const midLat = (start[0] + destination[0]) / 2;
        const midLng = (start[1] + destination[1]) / 2;
        routePoints = [
          start,
          [start[0] + (midLat - start[0]) * 0.5 + 0.0015, start[1] + (midLng - start[1]) * 0.5 - 0.0012],
          [midLat, midLng],
          [midLat + (destination[0] - midLat) * 0.5 - 0.001, midLng + (destination[1] - midLng) * 0.5 + 0.0015],
          destination,
        ];
        const dist = haversineDistance(start[0], start[1], destination[0], destination[1]);
        etaMinutes = Math.max(2, Math.round((dist / 25) * 60));
        distanceKm = formatDistance(dist);
      }

      setActiveRoute({
        destinationName: shelter.name,
        points: routePoints,
        etaMinutes,
        distanceKm,
        shadeSaving: "40%",
      });

      setDirectionsShelter(null);
      setMapCenter(destination);
    },
    [userLocation]
  );

  const toggleMapStyle = useCallback(() => {
    setMapStyle((prev) => (prev === "satellite" ? "light" : "satellite"));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setMapStyle((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Viewport Map */}
      <div className="flex-1 relative">
        <MapView
          shelters={allShelters}
          onShelterSelect={handleShelterSelect}
          userLocation={userLocation}
          center={mapCenter}
          onCenterChange={handleCenterChange}
          mapStyle={mapStyle}
          activeRoute={activeRoute}
        />

        {/* Floating Filter & Control Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onSelectShelter={handleShelterSelect}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          mapStyle={mapStyle}
          onToggleMapStyle={toggleMapStyle}
          onToggleDarkMode={toggleDarkMode}
          activeRoute={activeRoute}
          onClearRoute={() => setActiveRoute(null)}
          onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        />
      </div>

      {/* Bottom sheet with nearby shelters */}
      <BottomSheet
        title="Nearby Shelters"
        count={nearbyShelters.length}
        isDark={mapStyle === "dark"}
        onLocate={handleLocate}
        isLocating={isLocating}
      >
        {nearbyShelters.map((shelter, i) => (
          <ShelterCard
            key={shelter.id}
            shelter={shelter}
            distance={formatDistance(shelter.distance)}
            onSelect={handleShelterSelect}
            index={i}
            isDark={mapStyle === "dark"}
          />
        ))}

        {nearbyShelters.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted">
              {searchQuery
                ? `No shelters match "${searchQuery}".`
                : "No shelters found within 20 km for this filter."}
            </p>
          </div>
        )}
      </BottomSheet>

      {/* Shelter Detail Modal */}
      <ShelterDetail
        shelter={selectedShelter}
        onClose={() => setSelectedShelter(null)}
        onGetDirections={(s) => {
          setSelectedShelter(null);
          handleStartInAppRouting(s);
        }}
        isDark={mapStyle === "dark"}
      />

      {/* Minimal In-App Partner Submission Modal */}
      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        isDark={mapStyle === "dark"}
      />
    </div>
  );
}

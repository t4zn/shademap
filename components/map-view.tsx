"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Shelter, ShelterType } from "@/data/shelters";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/data/shelters";
import type { MapStyleType } from "@/components/filter-bar";

// Fix default Leaflet marker icon issue in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "",
  iconRetinaUrl: "",
  shadowUrl: "",
});

// Custom compact Google Maps style pin icons
function createMarkerIcon(type: ShelterType): L.DivIcon {
  const colorClass = type === "platform" ? "platform" : type === "municipal" ? "municipal" : "community";

  // Compact 12px SVG icons
  const iconSvg =
    type === "platform"
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`
      : type === "municipal"
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
      : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`;

  return L.divIcon({
    className: "rich-marker-container",
    html: `
      <div class="rich-marker-pin ${colorClass}">
        <div class="rich-marker-icon">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 22],
    popupAnchor: [0, -20],
  });
}

// Classic blue pulsating dot for user location
function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: "user-location-container",
    html: `<div class="user-location-marker"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export interface ActiveRoute {
  destinationName: string;
  points: [number, number][];
  etaMinutes: number;
  distanceKm: string;
  shadeSaving: string;
}

interface MapViewInnerProps {
  shelters: Shelter[];
  onShelterSelect: (shelter: Shelter) => void;
  userLocation: [number, number] | null;
  center?: [number, number];
  onCenterChange?: (lat: number, lng: number) => void;
  mapStyle?: MapStyleType;
  activeRoute?: ActiveRoute | null;
}

function MapEventsHandler({
  center,
  onCenterChange,
  url,
  attribution,
}: {
  center?: [number, number];
  onCenterChange?: (lat: number, lng: number) => void;
  url: string;
  attribution: string;
}) {
  const map = useMap();
  const prevCenterRef = useRef<[number, number] | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Safely manage tile layer updates directly on Leaflet map instance without React DOM reconciler unmounting glitches
  useEffect(() => {
    if (!tileLayerRef.current) {
      tileLayerRef.current = L.tileLayer(url, { attribution }).addTo(map);
    } else {
      tileLayerRef.current.setUrl(url);
    }
  }, [map, url, attribution]);

  // Smooth fly to center ONLY when center prop actually changes via locate click
  useEffect(() => {
    if (!center) return;
    if (
      !prevCenterRef.current ||
      prevCenterRef.current[0] !== center[0] ||
      prevCenterRef.current[1] !== center[1]
    ) {
      map.flyTo(center, 13, { duration: 1.2 });
      prevCenterRef.current = center;
    }
  }, [map, center]);

  // Listen to map drag/pan end
  useEffect(() => {
    if (!onCenterChange) return;

    const handleMoveEnd = () => {
      const c = map.getCenter();
      onCenterChange(c.lat, c.lng);
    };

    map.on("moveend", handleMoveEnd);
    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [map, onCenterChange]);

  return null;
}

function MapViewInner({
  shelters,
  onShelterSelect,
  userLocation,
  center,
  onCenterChange,
  mapStyle = "light",
  activeRoute = null,
}: MapViewInnerProps) {
  const tileUrl =
    mapStyle === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : mapStyle === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const tileAttribution =
    mapStyle === "satellite"
      ? "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

  return (
    <MapContainer
      center={center || DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="w-full h-full"
      zoomControl={true}
      attributionControl={true}
    >
      <MapEventsHandler
        center={center}
        onCenterChange={onCenterChange}
        url={tileUrl}
        attribution={tileAttribution}
      />

      {/* Render Google Maps vibrant royal blue navigation route polyline */}
      {activeRoute && activeRoute.points.length > 0 && (
        <>
          {/* Casing stroke for high visibility contrast */}
          <Polyline
            positions={activeRoute.points}
            pathOptions={{
              color: mapStyle === "dark" ? "#60a5fa" : "#1d4ed8",
              weight: 10,
              opacity: 0.5,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
          {/* Core solid Google Blue navigation polyline */}
          <Polyline
            positions={activeRoute.points}
            pathOptions={{
              color: mapStyle === "dark" ? "#3b82f6" : "#2563eb",
              weight: 6,
              opacity: 1,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </>
      )}

      {/* Blue pulsating dot for user location */}
      {userLocation && (
        <Marker position={userLocation} icon={createUserLocationIcon()}>
          <Popup className="custom-popup">
            <span className="text-sm font-medium">Your location</span>
          </Popup>
        </Marker>
      )}

      {/* Shelter markers */}
      {shelters.map((shelter) => (
        <Marker
          key={shelter.id}
          position={[shelter.lat, shelter.lng]}
          icon={createMarkerIcon(shelter.type)}
          eventHandlers={{
            click: () => onShelterSelect(shelter),
          }}
        >
          <Popup className="custom-popup">
            <div className="p-1">
              <p className="text-sm font-semibold text-[#12161e] mb-0.5">{shelter.name}</p>
              <p className="text-xs text-[#5b6570]">{shelter.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapViewInner;

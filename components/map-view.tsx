"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
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

// Calculate bearing/heading angle in degrees between two GPS points
function getBearing(startLat: number, startLng: number, destLat: number, destLng: number): number {
  const y = Math.sin((destLng - startLng) * (Math.PI / 180)) * Math.cos(destLat * (Math.PI / 180));
  const x =
    Math.cos(startLat * (Math.PI / 180)) * Math.sin(destLat * (Math.PI / 180)) -
    Math.sin(startLat * (Math.PI / 180)) * Math.cos(destLat * (Math.PI / 180)) * Math.cos((destLng - startLng) * (Math.PI / 180));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Uber style bike rider / Moto navigation marker icon rotated along road bearing
function createUserLocationIcon(isNavigating: boolean = false, heading: number = 0): L.DivIcon {
  if (isNavigating) {
    return L.divIcon({
      className: "user-nav-arrow-container",
      html: `
        <div class="user-nav-arrow-wrapper">
          <div class="user-nav-arrow-icon" style="transform: rotate(${heading}deg);">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Front Wheel / Tire */}
              <rect x="18" y="2" width="4" height="7" rx="2" fill="#2D3748" />

              {/* Black Handlebar Grip Bar */}
              <path d="M11 7C11 6.17157 11.6716 5.5 12.5 5.5H27.5C28.3284 5.5 29 6.17157 29 7V7C29 7.82843 28.3284 8.5 27.5 8.5H12.5C11.6716 8.5 11 7.82843 11 7V7Z" fill="#1A202C" />

              {/* Side Mirrors & Grips */}
              <circle cx="10" cy="7" r="2" fill="#4A5568" />
              <circle cx="30" cy="7" r="2" fill="#4A5568" />
              <rect x="8" y="6" width="3" height="2" rx="1" fill="#1A202C" />
              <rect x="29" y="6" width="3" height="2" rx="1" fill="#1A202C" />

              {/* Bright Headlight glow */}
              <ellipse cx="20" cy="6" rx="3.5" ry="1.5" fill="#EDF2F7" />

              {/* Curved Green Scooter Apron / Fairing */}
              <path d="M12 9C12 7.5 14 6.5 20 6.5C26 6.5 28 7.5 28 9C29.5 14 27.5 21 24.5 23.5C23 24.5 17 24.5 15.5 23.5C12.5 21 10.5 14 12 9Z" fill="#58B227" />

              {/* Scooter Body Inner Shield Line */}
              <path d="M14.5 9.5C14.5 8.5 16 7.8 20 7.8C24 7.8 25.5 8.5 25.5 9.5C26.5 13.5 25 19 22.5 21.2C21.5 22 18.5 22 17.5 21.2C15 19 13.5 13.5 14.5 9.5Z" fill="#48971E" />

              {/* Rider Helmet (Dark Visor + White Shell) */}
              <circle cx="20" cy="15" r="4.8" fill="#1A202C" />
              <circle cx="20" cy="15" r="4.2" fill="#E2E8F0" />
              <path d="M16.5 13.5C17.5 12 22.5 12 23.5 13.5L22.5 15.5H17.5L16.5 13.5Z" fill="#2D3748" />

              {/* Rider Arms holding Handlebars */}
              <path d="M13 14C11 11.5 12 8 13.5 7.5" stroke="#E2E8F0" stroke-width="2.2" stroke-linecap="round" />
              <path d="M27 14C29 11.5 28 8 26.5 7.5" stroke="#E2E8F0" stroke-width="2.2" stroke-linecap="round" />

              {/* Rider Jacket Body */}
              <path d="M14.5 16.5C14.5 15 16 14.2 20 14.2C24 14.2 25.5 15 25.5 16.5C26 21 24.5 28 23 31.5C22 33.5 18 33.5 17 31.5C15.5 28 14 21 14.5 16.5Z" fill="#EDF2F7" />

              {/* High-vis Yellow Vest / Accent */}
              <path d="M15.5 17.5C15.5 16 17 15.5 20 15.5C23 15.5 24.5 16 24.5 17.5C25 21 24 26 22.5 28.5C21.8 29.5 18.2 29.5 17.5 28.5C16 26 15 21 15.5 17.5Z" fill="#ECC94B" />

              {/* Scooter Rear Body / Seat Base */}
              <path d="M15 29C15 27.5 16.5 26.5 20 26.5C23.5 26.5 25 27.5 25 29L24 35C23.5 37 16.5 37 16 35L15 29Z" fill="#2D3748" />

              {/* Rear Light / Taillight */}
              <rect x="18" y="36" width="4" height="2" rx="1" fill="#E53E3E" />

              {/* Rear Tire */}
              <rect x="18.5" y="35" width="3" height="4" rx="1.5" fill="#1A202C" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }

  return L.divIcon({
    className: "user-location-container",
    html: `<div class="user-location-marker"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export interface TurnStep {
  instruction: string;
  distance: string;
  distanceMeters: number;
  type: "straight" | "left" | "right" | "u-turn" | "destination";
  location: [number, number]; // [lat, lng] of the maneuver point
}

export interface ActiveRoute {
  destinationName: string;
  points: [number, number][];
  etaMinutes: number;
  distanceKm: string;
  shadeSaving: string;
  steps?: TurnStep[];
}

interface MapViewInnerProps {
  shelters: Shelter[];
  onShelterSelect: (shelter: Shelter) => void;
  userLocation: [number, number] | null;
  center?: [number, number];
  onCenterChange?: (lat: number, lng: number) => void;
  mapStyle?: MapStyleType;
  activeRoute?: ActiveRoute | null;
  isNavigating?: boolean;
}

function MapEventsHandler({
  center,
  onCenterChange,
  url,
  attribution,
  activeRoute,
  isNavigating = false,
  userLocation,
  mapStyle,
}: {
  center?: [number, number];
  onCenterChange?: (lat: number, lng: number) => void;
  url: string;
  attribution: string;
  activeRoute?: ActiveRoute | null;
  isNavigating?: boolean;
  userLocation?: [number, number] | null;
  mapStyle: MapStyleType;
}) {
  const map = useMap();
  const prevCenterRef = useRef<[number, number] | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polylineCasingRef = useRef<L.Polyline | null>(null);
  const polylineCoreRef = useRef<L.Polyline | null>(null);

  // Safely manage tile layer updates directly on Leaflet map instance without React DOM reconciler unmounting glitches
  useEffect(() => {
    if (!tileLayerRef.current) {
      tileLayerRef.current = L.tileLayer(url, { attribution }).addTo(map);
    } else {
      tileLayerRef.current.setUrl(url);
    }
  }, [map, url, attribution]);

  // Safely manage polyline navigation route layers & camera zoom position
  useEffect(() => {
    if (activeRoute && activeRoute.points.length > 0) {
      const casingColor = mapStyle === "dark" ? "#60a5fa" : "#1d4ed8";
      const coreColor = mapStyle === "dark" ? "#3b82f6" : "#2563eb";

      if (!polylineCasingRef.current) {
        polylineCasingRef.current = L.polyline(activeRoute.points, {
          color: casingColor,
          weight: 10,
          opacity: 0.5,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
      } else {
        polylineCasingRef.current.setLatLngs(activeRoute.points);
        polylineCasingRef.current.setStyle({ color: casingColor });
      }

      if (!polylineCoreRef.current) {
        polylineCoreRef.current = L.polyline(activeRoute.points, {
          color: coreColor,
          weight: 6,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
      } else {
        polylineCoreRef.current.setLatLngs(activeRoute.points);
        polylineCoreRef.current.setStyle({ color: coreColor });
      }

      if (isNavigating) {
        // Authentic Google Maps live navigation camera:
        // Close-up zoomed-in view (level 18) centered on driver's current start position / location
        const navCenter = userLocation || activeRoute.points[0];
        
        // Offset center downward in viewport pixel space so the route ahead remains clearly visible up screen
        const point = map.project(navCenter, 18);
        const adjustedPoint = L.point(point.x, point.y - 120);
        const adjustedCenter = map.unproject(adjustedPoint, 18);

        map.flyTo(adjustedCenter, 18, {
          animate: true,
          duration: 1.2,
        });
      } else {
        // Route preview mode: Fit full route geometry with padding above bottom sheet
        const bounds = L.latLngBounds(activeRoute.points);
        map.fitBounds(bounds, {
          paddingTopLeft: [60, 100],
          paddingBottomRight: [60, window.innerHeight * 0.55],
          animate: true,
          duration: 1.2,
        });
      }
    } else {
      if (polylineCasingRef.current) {
        map.removeLayer(polylineCasingRef.current);
        polylineCasingRef.current = null;
      }
      if (polylineCoreRef.current) {
        map.removeLayer(polylineCoreRef.current);
        polylineCoreRef.current = null;
      }
    }
  }, [map, activeRoute, mapStyle, isNavigating, userLocation]);

  // Smooth fly to center ONLY when center prop actually changes via locate click and no active route fitBounds is active
  useEffect(() => {
    if (!center || activeRoute) return;
    if (
      !prevCenterRef.current ||
      prevCenterRef.current[0] !== center[0] ||
      prevCenterRef.current[1] !== center[1]
    ) {
      // Offset target center upwards so marker remains visible above bottom drawer
      const targetPoint = map.project(center, 14);
      const adjustedPoint = L.point(targetPoint.x, targetPoint.y + window.innerHeight * 0.22);
      const adjustedCenter = map.unproject(adjustedPoint, 14);

      map.flyTo(adjustedCenter, 14, { duration: 1.2 });
      prevCenterRef.current = center;
    }
  }, [map, center, activeRoute]);

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
  isNavigating = false,
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

  // Determine heading and snapped position for user marker during navigation
  const navHeading =
    isNavigating && activeRoute && activeRoute.points.length > 1
      ? getBearing(
          activeRoute.points[0][0],
          activeRoute.points[0][1],
          activeRoute.points[1][0],
          activeRoute.points[1][1]
        )
      : 0;

  const navMarkerPos =
    isNavigating && activeRoute && activeRoute.points.length > 0
      ? activeRoute.points[0]
      : userLocation;

  return (
    <MapContainer
      center={center || DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={false}
    >
      <MapEventsHandler
        center={center}
        onCenterChange={onCenterChange}
        url={tileUrl}
        attribution={tileAttribution}
        activeRoute={activeRoute}
        isNavigating={isNavigating}
        userLocation={navMarkerPos}
        mapStyle={mapStyle}
      />

      {/* Blue pulsating dot or Google Maps navigation arrow for user location */}
      {navMarkerPos && (
        <Marker position={navMarkerPos} icon={createUserLocationIcon(isNavigating, navHeading)}>
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

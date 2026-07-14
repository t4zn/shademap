"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Route,
  X,
  Building2,
  Navigation,
  Clock,
  ShieldCheck,
  Moon,
  Sun,
  Globe2,
  MapPin,
  ChevronRight,
  Volume2,
  VolumeX,
  CornerUpRight,
  ArrowUp,
  CornerUpLeft,
} from "lucide-react";
import { cn, formatDistance } from "@/lib/utils";
import type { Shelter, ShelterType } from "@/data/shelters";
import type { ActiveRoute } from "@/components/map-view";

type FilterType = "all" | ShelterType;
export type MapStyleType = "light" | "satellite" | "dark";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: (Shelter & { distance?: number })[];
  onSelectShelter: (shelter: Shelter) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  mapStyle: MapStyleType;
  onToggleMapStyle: () => void;
  activeRoute: ActiveRoute | null;
  isNavigating: boolean;
  userLocation: [number, number] | null;
  onClearRoute: () => void;
  onOpenPartnerModal: () => void;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "platform", label: "Platform" },
  { value: "municipal", label: "Municipal" },
  { value: "community", label: "Community" },
];

/** Haversine formula to compute distance in meters between two GPS points */
function gpsDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectShelter,
  activeFilter,
  onFilterChange,
  mapStyle,
  onToggleMapStyle,
  activeRoute,
  isNavigating,
  userLocation,
  onClearRoute,
  onOpenPartnerModal,
}: FilterBarProps) {
  const isDark = mapStyle === "dark";
  const showDropdown = searchQuery.trim().length > 0;

  // Navigation state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [livePosition, setLivePosition] = useState<[number, number] | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSpokenStepRef = useRef<number>(-1);

  const steps = activeRoute?.steps;
  const hasRealSteps = steps && steps.length > 0;

  // Start high-accuracy GPS watching when navigation is active
  useEffect(() => {
    if (!isNavigating || !activeRoute) {
      // Clean up GPS watch & speech
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setCurrentStepIndex(0);
      setLivePosition(null);
      lastSpokenStepRef.current = -1;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Initialize live position from passed-in user location
    if (userLocation) {
      setLivePosition(userLocation);
    }

    // Start high-accuracy GPS watcher for real-time position tracking
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setLivePosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {}, // Silently handle errors
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isNavigating, activeRoute, userLocation]);

  // GPS-based step advancement: advance only when user physically moves near next step waypoint
  useEffect(() => {
    if (!isNavigating || !hasRealSteps || !livePosition) return;

    // Find the closest upcoming step the user is near (within 50m threshold)
    for (let i = currentStepIndex; i < steps.length; i++) {
      const step = steps[i];
      const dist = gpsDistanceMeters(livePosition[0], livePosition[1], step.location[0], step.location[1]);
      if (dist < 50 && i > currentStepIndex) {
        setCurrentStepIndex(i);
        break;
      }
    }
  }, [isNavigating, hasRealSteps, livePosition, currentStepIndex, steps]);

  // Voice narration: speak current step instruction when step index changes
  useEffect(() => {
    if (!isNavigating || !hasRealSteps) return;
    if (isVoiceMuted) return;
    if (lastSpokenStepRef.current === currentStepIndex) return;

    const currentStep = steps[currentStepIndex];
    if (currentStep && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentStep.instruction);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      lastSpokenStepRef.current = currentStepIndex;
    }
  }, [isNavigating, hasRealSteps, currentStepIndex, isVoiceMuted, steps]);

  // Compute remaining distance and ETA from current position
  const remainingInfo = useMemo(() => {
    if (!hasRealSteps || !livePosition) {
      return { distance: activeRoute?.distanceKm || "", eta: activeRoute?.etaMinutes || 0 };
    }
    let remainingDist = 0;
    for (let i = currentStepIndex; i < steps.length; i++) {
      remainingDist += steps[i].distanceMeters;
    }
    const remainingKm = remainingDist < 1000
      ? `${Math.round(remainingDist)} m`
      : `${(remainingDist / 1000).toFixed(1)} km`;
    const remainingEta = Math.max(1, Math.round((remainingDist / 1000) / 25 * 60));
    return { distance: remainingKm, eta: remainingEta };
  }, [hasRealSteps, livePosition, currentStepIndex, steps, activeRoute]);

  const activeStep = hasRealSteps
    ? steps[currentStepIndex] || steps[0]
    : { instruction: `Head towards ${activeRoute?.destinationName || "destination"}`, distance: activeRoute?.distanceKm || "", distanceMeters: 0, type: "straight" as const, location: [0, 0] as [number, number] };

  return (
    <div className="fixed top-3 left-3 right-3 z-[500] pointer-events-none flex flex-col items-center gap-2" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Search pill container with relative positioning for dropdown */}
      <div className="pointer-events-auto w-full md:max-w-xl relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={cn(
            "w-full rounded-full p-1.5 pl-3.5 pr-1.5 border transition-colors duration-300 relative z-10",
            "shadow-[0_2px_12px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)]",
            "flex flex-row items-center justify-between gap-1.5 flex-nowrap",
            isDark
              ? "bg-[#1e2430] border-white/10 text-white"
              : "bg-white border-black/[0.04] text-charcoal"
          )}
        >
          {/* Interactive search input */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className={cn("w-4 h-4 shrink-0", isDark ? "text-white/60" : "text-muted")} strokeWidth={2.2} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search shade, city, water spots..."
              className={cn(
                "w-full text-sm font-medium bg-transparent focus:outline-none",
                isDark ? "text-white placeholder:text-white/40" : "text-charcoal placeholder:text-muted/60"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className={cn("p-1", isDark ? "text-white/60 hover:text-white" : "text-muted hover:text-charcoal")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* In-app Partner Form Popup Trigger FAB */}
            <button
              onClick={onOpenPartnerModal}
              title="Add Rest Point"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal/10 text-teal hover:bg-teal/20 transition-all duration-200 active:scale-[0.95] text-xs font-semibold"
            >
              <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">Partner</span>
            </button>

            {/* Satellite Layer FAB */}
            <button
              onClick={onToggleMapStyle}
              title={mapStyle === "satellite" ? "Switch to Map" : "Switch to Satellite"}
              className={cn(
                "p-2 rounded-full transition-all duration-200 active:scale-[0.92]",
                mapStyle === "satellite"
                  ? "bg-[#0d9488] text-white shadow-sm"
                  : isDark
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "bg-black/[0.04] text-charcoal hover:bg-black/[0.08]"
              )}
            >
              <Globe2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </motion.div>

        {/* Live Search Results Dropdown directly attached underneath search bar */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden border z-50",
                "shadow-[0_12px_32px_rgba(0,0,0,0.18)] max-h-72 overflow-y-auto p-1.5 space-y-1",
                isDark
                  ? "bg-[#181d28] border-white/10 text-white"
                  : "bg-white border-black/[0.06] text-charcoal"
              )}
            >
              {searchResults.length > 0 ? (
                searchResults.map((shelter) => (
                  <button
                    key={shelter.id}
                    onClick={() => {
                      onSelectShelter(shelter);
                      onSearchChange("");
                    }}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-3",
                      isDark
                        ? "hover:bg-white/10 active:bg-white/15"
                        : "hover:bg-black/[0.04] active:bg-black/[0.06]"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-teal" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{shelter.name}</p>
                        <p className={cn("text-[11px] truncate flex items-center gap-1", isDark ? "text-white/60" : "text-muted")}>
                          <span className="font-semibold text-teal shrink-0">{shelter.city}</span>
                          <span>•</span>
                          <span className="truncate">{shelter.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {shelter.distance !== undefined && (
                        <span className={cn("text-[11px] font-semibold", isDark ? "text-white/70" : "text-muted")}>
                          {formatDistance(shelter.distance)}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className={cn("text-xs font-medium", isDark ? "text-white/60" : "text-muted")}>
                    No shelters found for "{searchQuery}"
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Horizontal Filter Chips Row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="pointer-events-auto w-full md:max-w-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none px-1"
      >
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap",
              "border shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 active:scale-[0.95]",
              activeFilter === filter.value
                ? "bg-charcoal text-white border-charcoal"
                : isDark
                ? "bg-[#1e2430] text-white/90 border-white/10 hover:bg-white/10"
                : "bg-white text-charcoal border-black/[0.08] hover:bg-black/[0.02]"
            )}
          >
            {filter.label}
          </button>
        ))}
      </motion.div>

      {/* Authentic Google Maps Turn-by-Turn Voice Navigation Banner */}
      {activeRoute && isNavigating && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          className={cn(
            "pointer-events-auto w-full md:max-w-xl border",
            "bg-[#15803d] text-white rounded-3xl px-4 py-3.5 shadow-[0_12px_36px_rgba(21,128,61,0.35)]",
            "flex flex-col gap-3"
          )}
        >
          {/* Active Turn Instruction Banner */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Dynamic Turn Arrow Indicator */}
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                {activeStep.type === "right" ? (
                  <CornerUpRight className="w-6 h-6 text-white" strokeWidth={2.8} />
                ) : activeStep.type === "left" ? (
                  <CornerUpLeft className="w-6 h-6 text-white" strokeWidth={2.8} />
                ) : (
                  <ArrowUp className="w-6 h-6 text-white" strokeWidth={2.8} />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-extrabold text-white/80 uppercase tracking-widest leading-none">
                  In {activeStep.distance}
                </p>
                <h4 className="text-[13px] sm:text-sm font-extrabold text-white leading-snug mt-0.5" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {activeStep.instruction}
                </h4>
              </div>
            </div>

            {/* Voice Mute / Narration Toggle */}
            <button
              onClick={() => {
                const nextMuted = !isVoiceMuted;
                setIsVoiceMuted(nextMuted);
                if (nextMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              title={isVoiceMuted ? "Unmute Voice Guidance" : "Mute Voice Guidance"}
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white shrink-0 active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              {isVoiceMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Bottom Bar: Destination, ETA, & Exit Button */}
          <div className="flex items-center justify-between border-t border-white/20 pt-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-base font-black text-white leading-none">
                {remainingInfo.eta} min
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white/90">
                • {remainingInfo.distance}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-100 truncate">
                • {activeRoute.destinationName}
              </span>
            </div>

            <button
              onClick={() => {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
                onClearRoute();
              }}
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-[13px] font-bold text-white transition-colors shrink-0 active:scale-95 flex items-center gap-1.5 min-h-[36px]"
            >
              <X className="w-4 h-4" />
              <span>Exit</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export type { FilterType };

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Route, X, Building2, Navigation, Clock, ShieldCheck, Moon, Sun, Globe2, MapPin, ChevronRight } from "lucide-react";
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
  onToggleDarkMode: () => void;
  activeRoute: ActiveRoute | null;
  onClearRoute: () => void;
  onOpenPartnerModal: () => void;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "platform", label: "Platform" },
  { value: "municipal", label: "Municipal" },
  { value: "community", label: "Community" },
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectShelter,
  activeFilter,
  onFilterChange,
  mapStyle,
  onToggleMapStyle,
  onToggleDarkMode,
  activeRoute,
  onClearRoute,
  onOpenPartnerModal,
}: FilterBarProps) {
  const isDark = mapStyle === "dark";
  const showDropdown = searchQuery.trim().length > 0;

  return (
    <div className="fixed top-3 left-3 right-3 z-[500] pointer-events-none flex flex-col items-center gap-2">
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
            {/* Partner Form Popup Trigger FAB */}
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
                  ? "bg-teal text-white shadow-sm"
                  : isDark
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "bg-black/[0.04] text-charcoal hover:bg-black/[0.08]"
              )}
            >
              <Globe2 className="w-4 h-4" strokeWidth={2} />
            </button>

            {/* Dark / Light Mode Toggle FAB (Far Right End) */}
            <button
              onClick={onToggleDarkMode}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={cn(
                "p-2 rounded-full transition-all duration-200 active:scale-[0.92]",
                isDark
                  ? "bg-amber/20 text-amber hover:bg-amber/30"
                  : "bg-black/[0.04] text-charcoal hover:bg-black/[0.08]"
              )}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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

      {/* Google Maps Style Rich Live Turn-by-Turn Navigation Bar */}
      {activeRoute && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          className={cn(
            "pointer-events-auto w-full md:max-w-xl",
            "bg-blue-600 text-white rounded-2xl p-3.5",
            "shadow-[0_6px_24px_rgba(37,99,235,0.3)]",
            "flex flex-col gap-2"
          )}
        >
          {/* Header & Destination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4 text-white" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-white/80 uppercase tracking-wider leading-none">
                  Navigating to
                </p>
                <h4 className="text-sm font-bold text-white truncate leading-tight">
                  {activeRoute.destinationName}
                </h4>
              </div>
            </div>
            <button
              onClick={onClearRoute}
              title="Exit Navigation"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details Row: ETA, Distance, & Shade Corridor Shield */}
          <div className="flex items-center justify-between border-t border-white/15 pt-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-white/90" />
                <span className="text-base font-extrabold text-white leading-none">
                  {activeRoute.etaMinutes} min
                </span>
              </div>
              <span className="text-xs font-semibold text-white/80">
                • {activeRoute.distanceKm}
              </span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{activeRoute.shadeSaving} Less Heat</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export type { FilterType };

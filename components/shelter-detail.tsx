"use client";

import {
  Droplets,
  Armchair,
  Snowflake,
  DoorOpen,
  Clock,
  MapPin,
  ShieldCheck,
  Navigation,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shelter } from "@/data/shelters";
import { SHELTER_TYPE_CONFIG } from "@/data/shelters";

interface ShelterDetailProps {
  shelter: Shelter | null;
  onClose: () => void;
  onGetDirections: (shelter: Shelter) => void;
  isDark?: boolean;
}

const AMENITIES = [
  { key: "water" as const, icon: Droplets, label: "Drinking Water" },
  { key: "seating" as const, icon: Armchair, label: "Seating Area" },
  { key: "ac" as const, icon: Snowflake, label: "Air Conditioning" },
  { key: "restroom" as const, icon: DoorOpen, label: "Restroom" },
];

export function ShelterDetailContent({
  shelter,
  onClose,
  onGetDirections,
  isDark = false,
}: ShelterDetailProps) {
  if (!shelter) return null;

  const typeConfig = SHELTER_TYPE_CONFIG[shelter.type];

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col h-full space-y-3 pt-1">
      {/* Apple iOS Card Header: Back button + Category Badge */}
      <div className="flex items-center justify-between shrink-0 select-none pb-1">
        <button
          onClick={onClose}
          className={cn(
            "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95",
            isDark
              ? "bg-white/10 text-white hover:bg-white/15"
              : "bg-black/[0.05] text-charcoal hover:bg-black/[0.08]"
          )}
        >
          <ChevronLeft className="w-4 h-4 text-teal" />
          <span>Back to List</span>
        </button>

        <span
          className="inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-tight"
          style={{
            color: typeConfig.color,
            backgroundColor: isDark ? `${typeConfig.color}25` : typeConfig.bgColor,
          }}
        >
          {typeConfig.label}
        </span>
      </div>

      {/* Title & City */}
      <div className="space-y-0.5">
        <h2 className={cn("text-base md:text-lg font-extrabold leading-tight", isDark ? "text-white" : "text-charcoal")}>
          {shelter.name}
        </h2>
        <p className={cn("text-xs font-medium text-teal")}>
          {shelter.city}
        </p>
      </div>

      {/* Verification Badge */}
      {shelter.verified && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal/10 border border-teal/20 text-xs font-semibold text-teal">
          <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
          <span>Verified — {shelter.source}</span>
        </div>
      )}

      {/* Apple Style Grouped Information Block */}
      <div
        className={cn(
          "rounded-2xl border overflow-hidden divide-y text-xs",
          isDark
            ? "bg-[#222834] border-white/10 divide-white/10"
            : "bg-black/[0.03] border-black/[0.05] divide-black/[0.05]"
        )}
      >
        {/* Address Row */}
        <div className="px-3.5 py-2.5 flex items-start gap-2.5">
          <MapPin
            className={cn("w-4 h-4 mt-0.5 shrink-0", isDark ? "text-white/60" : "text-muted")}
            strokeWidth={1.8}
          />
          <span className={cn("font-medium leading-relaxed", isDark ? "text-white/90" : "text-charcoal")}>
            {shelter.address}
          </span>
        </div>

        {/* Hours Row */}
        <div className="px-3.5 py-2.5 flex items-center gap-2.5">
          <Clock
            className={cn("w-4 h-4 shrink-0", isDark ? "text-white/60" : "text-muted")}
            strokeWidth={1.8}
          />
          <span className={cn("font-medium", isDark ? "text-white/90" : "text-charcoal")}>
            {shelter.hours}
          </span>
        </div>
      </div>

      {/* Amenities Grid */}
      <div className="space-y-1.5">
        <h3 className={cn("text-xs font-bold uppercase tracking-wider text-muted/80 px-0.5")}>
          Available Facilities
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {AMENITIES.map(({ key, icon: Icon, label }) => {
            const available = shelter.amenities[key];
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors",
                  available
                    ? isDark
                      ? "bg-white/10 text-white border-white/15 font-semibold"
                      : "bg-white text-charcoal border-black/[0.06] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    : isDark
                    ? "bg-white/[0.02] text-white/30 border-white/5 line-through opacity-40"
                    : "bg-black/[0.01] text-muted/40 border-black/[0.02] line-through opacity-50"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Call-to-Action Bar */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onGetDirections(shelter)}
          className="flex-1 py-3 rounded-xl bg-teal text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-teal/90 transition-all active:scale-[0.97]"
        >
          <Navigation className="w-4 h-4" />
          Start In-App Live Route
        </button>
        <button
          onClick={openInMaps}
          className={cn(
            "p-3 rounded-xl border transition-colors shrink-0",
            isDark ? "bg-white/10 border-white/15 text-white hover:bg-white/15" : "bg-black/[0.04] border-black/[0.06] text-charcoal hover:bg-black/[0.08]"
          )}
          title="Open in Google Maps"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ShelterDetail({
  shelter,
  onClose,
  onGetDirections,
  isDark = false,
}: ShelterDetailProps) {
  return null;
}

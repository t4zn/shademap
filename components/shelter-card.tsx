"use client";

import { Droplets, Armchair, Snowflake, DoorOpen, Navigation, CheckCircle2, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shelter } from "@/data/shelters";
import { SHELTER_TYPE_CONFIG } from "@/data/shelters";

interface ShelterCardProps {
  shelter: Shelter;
  distance?: string;
  onSelect: (shelter: Shelter) => void;
  index?: number;
  isDark?: boolean;
}

const AMENITY_ICONS = {
  water: { icon: Droplets, label: "Water" },
  seating: { icon: Armchair, label: "Seating" },
  ac: { icon: Snowflake, label: "AC" },
  restroom: { icon: DoorOpen, label: "Restroom" },
} as const;

export function ShelterCard({
  shelter,
  distance,
  onSelect,
  isDark = false,
}: ShelterCardProps) {
  const typeConfig = SHELTER_TYPE_CONFIG[shelter.type];

  return (
    <button
      onClick={() => onSelect(shelter)}
      className={cn(
        "w-full text-left p-4 rounded-2xl transition-colors duration-150 cursor-pointer border active:scale-[0.99] min-h-[72px]",
        isDark
          ? "bg-[#222834] border-white/10 hover:border-white/20 text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
          : "bg-white border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header row: title + badge */}
          <div className="flex items-center gap-1.5 mb-1 truncate">
            <h3 className={cn("text-[15px] font-semibold truncate", isDark ? "text-white" : "text-charcoal")}>
              {shelter.name}
            </h3>
            {shelter.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0" fill="currentColor" stroke={isDark ? "#222834" : "white"} />
            )}
          </div>

          <p className={cn("text-[12px] truncate mb-2.5", isDark ? "text-white/60" : "text-muted/70")}>
            {shelter.address}
          </p>

          <div className="flex items-center gap-2">
            {/* Minimal type badge */}
            <span
              className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-tight"
              style={{
                color: typeConfig.color,
                backgroundColor: isDark ? `${typeConfig.color}25` : typeConfig.bgColor,
              }}
            >
              {typeConfig.label}
            </span>

            {/* Amenity icons */}
            <div className={cn("flex items-center gap-1.5", isDark ? "text-white/70" : "text-muted/60")}>
              {(
                Object.entries(AMENITY_ICONS) as [
                  keyof typeof AMENITY_ICONS,
                  (typeof AMENITY_ICONS)[keyof typeof AMENITY_ICONS]
                ][]
              ).map(([key, { icon: Icon, label }]) =>
                shelter.amenities[key] ? (
                  <div
                    key={key}
                    className={cn("p-1 rounded", isDark ? "bg-white/10" : "bg-black/[0.03]")}
                    title={label}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>

        {/* Right Action Column: Circular Compass Icon + Distance Below */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div
            title="Get Directions"
            className="w-10 h-10 rounded-full bg-teal text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
          >
            <Compass className="w-5 h-5" strokeWidth={2} />
          </div>
          {distance && (
            <span className={cn("text-[12px] font-semibold", isDark ? "text-white/70" : "text-muted")}>
              {distance}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

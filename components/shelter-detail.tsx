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
  ChevronLeft,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Flag,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shelter } from "@/data/shelters";
import { SHELTER_TYPE_CONFIG } from "@/data/shelters";
import type { ActiveRoute, TurnStep } from "@/components/map-view";

interface ShelterDetailProps {
  shelter: Shelter | null;
  onClose: () => void;
  onGetDirections: (shelter: Shelter) => void;
  isDark?: boolean;
  isNavigating?: boolean;
  activeRoute?: ActiveRoute | null;
}

const AMENITIES = [
  { key: "water" as const, icon: Droplets, label: "Water" },
  { key: "seating" as const, icon: Armchair, label: "Seating" },
  { key: "ac" as const, icon: Snowflake, label: "AC" },
  { key: "restroom" as const, icon: DoorOpen, label: "Restroom" },
];

function StepIcon({ type }: { type: TurnStep["type"] }) {
  switch (type) {
    case "right":
      return <CornerUpRight className="w-4 h-4 text-teal" strokeWidth={2.4} />;
    case "left":
      return <CornerUpLeft className="w-4 h-4 text-teal" strokeWidth={2.4} />;
    case "destination":
      return <Flag className="w-4 h-4 text-emerald-500" strokeWidth={2.4} />;
    case "u-turn":
      return <ArrowUp className="w-4 h-4 text-orange-500 rotate-180" strokeWidth={2.4} />;
    default:
      return <ArrowUp className="w-4 h-4 text-teal" strokeWidth={2.4} />;
  }
}

export function ShelterDetailContent({
  shelter,
  onClose,
  onGetDirections,
  isDark = false,
  isNavigating = false,
  activeRoute = null,
}: ShelterDetailProps) {
  if (!shelter) return null;

  const typeConfig = SHELTER_TYPE_CONFIG[shelter.type];

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const steps = activeRoute?.steps;
  const hasSteps = steps && steps.length > 0;

  return (
    <div className="flex flex-col h-full gap-3 pt-1">
      {/* Header: Back / End Route + Category */}
      <div className="flex items-center justify-between shrink-0 select-none">
        <button
          onClick={onClose}
          className={cn(
            "flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-full transition-all active:scale-95 min-h-[36px]",
            isDark
              ? "bg-white/10 text-white hover:bg-white/15"
              : "bg-black/[0.05] text-charcoal hover:bg-black/[0.08]"
          )}
        >
          <ChevronLeft className="w-4 h-4 text-teal" />
          <span>{isNavigating ? "End Route" : "Back to List"}</span>
        </button>

        <span
          className="inline-flex px-3 py-1.5 rounded-full text-[11px] font-bold tracking-tight"
          style={{
            color: typeConfig.color,
            backgroundColor: isDark ? `${typeConfig.color}25` : typeConfig.bgColor,
          }}
        >
          {typeConfig.label}
        </span>
      </div>

      {/* Title & City */}
      <div className="space-y-0.5 px-0.5">
        <h2 className={cn("text-[15px] sm:text-base md:text-lg font-extrabold leading-tight", isDark ? "text-white" : "text-charcoal")}>
          {shelter.name}
        </h2>
        <p className="text-[12px] font-medium text-teal">
          {shelter.city}
        </p>
      </div>

      {/* ─── Active Navigation: Route Summary + Step List ─── */}
      {isNavigating && activeRoute ? (
        <>
          {/* Route Summary Bar */}
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl border text-[13px]",
              isDark
                ? "bg-teal/15 border-teal/25 text-white"
                : "bg-teal/10 border-teal/20 text-charcoal"
            )}
          >
            <Route className="w-5 h-5 text-teal shrink-0" strokeWidth={2} />
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-base font-black text-teal">{activeRoute.etaMinutes} min</span>
              <span className="text-muted">•</span>
              <span>{activeRoute.distanceKm}</span>
            </div>
          </div>

          {/* Turn-by-Turn Directions */}
          {hasSteps && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted/80 px-0.5">
                Directions
              </h3>
              <div
                className={cn(
                  "rounded-2xl border overflow-hidden divide-y",
                  isDark
                    ? "bg-[#222834] border-white/10 divide-white/10"
                    : "bg-black/[0.02] border-black/[0.05] divide-black/[0.05]"
                )}
              >
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "px-3.5 py-3 flex items-center gap-3 min-h-[48px]",
                      i === 0 && (isDark ? "bg-teal/10" : "bg-teal/5")
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                      isDark ? "bg-white/10" : "bg-black/[0.05]"
                    )}>
                      <StepIcon type={step.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[13px] font-semibold leading-snug", isDark ? "text-white/90" : "text-charcoal")}>
                        {step.instruction}
                      </p>
                      <p className="text-muted/70 text-[11px] font-medium mt-0.5">{step.distance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Maps Button */}
          <button
            onClick={openInMaps}
            className={cn(
              "w-full py-3 rounded-2xl border font-bold text-[13px] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] min-h-[48px]",
              isDark
                ? "bg-white/10 border-white/15 text-white hover:bg-white/15"
                : "bg-white border-black/10 text-charcoal hover:bg-black/[0.03] shadow-sm"
            )}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Google_Maps_icon_%282026%29.svg/250px-Google_Maps_icon_%282026%29.svg.png"
              alt="Google Maps"
              className="w-5 h-5 shrink-0 object-contain"
            />
            <span>Open in Google Maps</span>
          </button>
        </>
      ) : (
        <>
          {/* ─── Standard Detail View ─── */}

          {/* Verification Badge */}
          {shelter.verified && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-teal/10 border border-teal/20 text-[12px] font-semibold text-teal min-h-[40px]">
              <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>Verified — {shelter.source}</span>
            </div>
          )}

          {/* Address & Hours Block */}
          <div
            className={cn(
              "rounded-2xl border overflow-hidden divide-y",
              isDark
                ? "bg-[#222834] border-white/10 divide-white/10"
                : "bg-black/[0.02] border-black/[0.05] divide-black/[0.05]"
            )}
          >
            <div className="px-4 py-3 flex items-start gap-3 min-h-[44px]">
              <MapPin
                className={cn("w-4 h-4 mt-0.5 shrink-0", isDark ? "text-white/60" : "text-muted")}
                strokeWidth={1.8}
              />
              <span className={cn("text-[13px] font-medium leading-relaxed", isDark ? "text-white/90" : "text-charcoal")}>
                {shelter.address}
              </span>
            </div>

            <div className="px-4 py-3 flex items-center gap-3 min-h-[44px]">
              <Clock
                className={cn("w-4 h-4 shrink-0", isDark ? "text-white/60" : "text-muted")}
                strokeWidth={1.8}
              />
              <span className={cn("text-[13px] font-medium", isDark ? "text-white/90" : "text-charcoal")}>
                {shelter.hours}
              </span>
            </div>
          </div>

          {/* Amenities — horizontal row for mobile */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted/80 px-0.5">
              Facilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(({ key, icon: Icon, label }) => {
                const available = shelter.amenities[key];
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium border min-h-[36px]",
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
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => onGetDirections(shelter)}
              className="w-full py-3.5 rounded-2xl bg-teal text-white text-[13px] font-bold flex items-center justify-center gap-2.5 shadow-md hover:bg-teal/90 transition-all active:scale-[0.98] min-h-[48px]"
            >
              <Navigation className="w-4 h-4" />
              Start Route
            </button>

            <button
              onClick={openInMaps}
              className={cn(
                "w-full py-3 rounded-2xl border font-bold text-[13px] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] min-h-[48px]",
                isDark
                  ? "bg-white/10 border-white/15 text-white hover:bg-white/15"
                  : "bg-white border-black/10 text-charcoal hover:bg-black/[0.03] shadow-sm"
              )}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Google_Maps_icon_%282026%29.svg/250px-Google_Maps_icon_%282026%29.svg.png"
                alt="Google Maps"
                className="w-5 h-5 shrink-0 object-contain"
              />
              <span>Open in Google Maps</span>
            </button>
          </div>
        </>
      )}
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

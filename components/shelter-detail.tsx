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
  { key: "water" as const, icon: Droplets, label: "Drinking Water" },
  { key: "seating" as const, icon: Armchair, label: "Seating Area" },
  { key: "ac" as const, icon: Snowflake, label: "Air Conditioning" },
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
          <span>{isNavigating ? "End Route" : "Back to List"}</span>
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

      {/* ─── Active Navigation: Route Summary + Step List ─── */}
      {isNavigating && activeRoute ? (
        <>
          {/* Route Summary Stats Bar */}
          <div
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border text-xs",
              isDark
                ? "bg-teal/15 border-teal/25 text-white"
                : "bg-teal/10 border-teal/20 text-charcoal"
            )}
          >
            <Route className="w-4 h-4 text-teal shrink-0" strokeWidth={2} />
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-sm font-black text-teal">{activeRoute.etaMinutes} min</span>
              <span className="text-muted">•</span>
              <span>{activeRoute.distanceKm}</span>
            </div>
          </div>

          {/* Turn-by-Turn Step List */}
          {hasSteps && (
            <div className="space-y-1.5">
              <h3 className={cn("text-xs font-bold uppercase tracking-wider text-muted/80 px-0.5")}>
                Directions
              </h3>
              <div
                className={cn(
                  "rounded-2xl border overflow-hidden divide-y text-xs",
                  isDark
                    ? "bg-[#222834] border-white/10 divide-white/10"
                    : "bg-black/[0.03] border-black/[0.05] divide-black/[0.05]"
                )}
              >
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "px-3.5 py-2.5 flex items-center gap-3",
                      i === 0 && (isDark ? "bg-teal/10" : "bg-teal/5")
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                      isDark ? "bg-white/10" : "bg-black/[0.05]"
                    )}>
                      <StepIcon type={step.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("font-semibold leading-snug truncate", isDark ? "text-white/90" : "text-charcoal")}>
                        {step.instruction}
                      </p>
                      <p className="text-muted/70 text-[10px] font-medium mt-0.5">{step.distance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open in Google Maps (secondary action during nav) */}
          <button
            onClick={openInMaps}
            className={cn(
              "w-full py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
              isDark
                ? "bg-white/10 border-white/15 text-white hover:bg-white/15"
                : "bg-white border-black/10 text-charcoal hover:bg-black/[0.03] shadow-sm"
            )}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Google_Maps_icon_%282026%29.svg/250px-Google_Maps_icon_%282026%29.svg.png"
              alt="Google Maps"
              className="w-4 h-4 shrink-0 object-contain"
            />
            <span>Open in Google Maps</span>
          </button>
        </>
      ) : (
        <>
          {/* ─── Standard Detail View (not navigating) ─── */}

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
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => onGetDirections(shelter)}
              className="w-full py-3 rounded-xl bg-teal text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-teal/90 transition-all active:scale-[0.98]"
            >
              <Navigation className="w-4 h-4" />
              Start Route
            </button>

            <button
              onClick={openInMaps}
              className={cn(
                "w-full py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                isDark
                  ? "bg-white/10 border-white/15 text-white hover:bg-white/15"
                  : "bg-white border-black/10 text-charcoal hover:bg-black/[0.03] shadow-sm"
              )}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Google_Maps_icon_%282026%29.svg/250px-Google_Maps_icon_%282026%29.svg.png"
                alt="Google Maps"
                className="w-4 h-4 shrink-0 object-contain"
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

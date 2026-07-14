"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Droplets,
  Armchair,
  Snowflake,
  DoorOpen,
  Clock,
  MapPin,
  ShieldCheck,
  Navigation,
  ExternalLink,
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

export function ShelterDetail({
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
    <AnimatePresence>
      {shelter && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
            onClick={onClose}
          />

          {/* Detail panel */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[1001]",
              "md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
              "md:max-w-lg md:w-full md:mx-4",
              "rounded-t-3xl md:rounded-3xl border transition-colors duration-300",
              "shadow-[0_-4px_40px_rgba(0,0,0,0.3)]",
              "max-h-[85vh] overflow-y-auto",
              isDark
                ? "bg-[#181d28] border-white/10 text-white"
                : "bg-white border-black/[0.06] text-charcoal"
            )}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className={cn("w-10 h-1 rounded-full", isDark ? "bg-white/20" : "bg-black/10")} />
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex px-3 py-1 rounded-xl text-xs font-semibold"
                      style={{
                        color: typeConfig.color,
                        backgroundColor: isDark ? `${typeConfig.color}25` : typeConfig.bgColor,
                      }}
                    >
                      {typeConfig.label}
                    </span>
                  </div>
                  <h2 className={cn("text-xl font-bold leading-tight", isDark ? "text-white" : "text-charcoal")}>
                    {shelter.name}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                    isDark ? "bg-white/10 hover:bg-white/15 text-white/80" : "bg-black/[0.05] hover:bg-black/[0.08] text-muted"
                  )}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Verification badge */}
              {shelter.verified && (
                <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-teal/15 border border-teal/20">
                  <ShieldCheck
                    className="w-4.5 h-4.5 text-teal shrink-0"
                    strokeWidth={2}
                  />
                  <span className="text-sm font-medium text-teal">
                    Verified — {shelter.source}
                  </span>
                </div>
              )}

              {/* Address */}
              <div className="mt-5 flex items-start gap-2.5">
                <MapPin
                  className={cn("w-4.5 h-4.5 mt-0.5 shrink-0", isDark ? "text-white/60" : "text-muted")}
                  strokeWidth={1.8}
                />
                <span className={cn("text-sm leading-relaxed", isDark ? "text-white/80" : "text-muted")}>
                  {shelter.address}
                </span>
              </div>

              {/* Hours */}
              <div className="mt-3 flex items-start gap-2.5">
                <Clock
                  className={cn("w-4.5 h-4.5 mt-0.5 shrink-0", isDark ? "text-white/60" : "text-muted")}
                  strokeWidth={1.8}
                />
                <span className={cn("text-sm leading-relaxed", isDark ? "text-white/80" : "text-muted")}>
                  {shelter.hours}
                </span>
              </div>

              {/* Amenities */}
              <div className="mt-6">
                <h3 className={cn("text-sm font-semibold mb-3", isDark ? "text-white" : "text-charcoal")}>
                  Amenities
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITIES.map(({ key, icon: Icon, label }) => {
                    const available = shelter.amenities[key];
                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium border",
                          available
                            ? isDark
                              ? "bg-white/10 text-white border-white/15"
                              : "bg-black/[0.03] text-charcoal border-black/[0.04]"
                            : isDark
                            ? "bg-white/[0.02] text-white/30 border-white/5 line-through opacity-50"
                            : "bg-black/[0.01] text-muted/40 border-black/[0.02] line-through"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3 pt-2">
                <button
                  onClick={() => onGetDirections(shelter)}
                  className="flex-1 py-3 rounded-xl bg-teal text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-teal/90 transition-colors active:scale-[0.97]"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

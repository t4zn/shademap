"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, TreePine, Clock, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shelter } from "@/data/shelters";

interface RouteComparisonProps {
  shelter: Shelter | null;
  isOpen?: boolean;
  onClose: () => void;
  onStartInAppRouting: (shelter: Shelter) => void;
  isDark?: boolean;
}

export function RouteComparison({
  shelter,
  isOpen = true,
  onClose,
  onStartInAppRouting,
  isDark = false,
}: RouteComparisonProps) {
  if (!shelter || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 260,
            }}
            className={cn(
              "fixed bottom-6 left-4 right-4 z-[1001]",
              "md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
              "md:max-w-md md:w-full",
              "rounded-3xl border shadow-[0_16px_48px_rgba(0,0,0,0.2)] overflow-hidden",
              isDark ? "bg-[#181d28] border-white/10 text-white" : "bg-white border-black/[0.08] text-charcoal"
            )}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-teal" strokeWidth={2.2} />
                <h3 className={cn("text-base font-bold", isDark ? "text-white" : "text-charcoal")}>
                  AI Thermal Route Engine
                </h3>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isDark ? "bg-white/10 hover:bg-white/20 text-white/80" : "bg-black/[0.05] hover:bg-black/[0.1] text-muted"
                )}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-3">
              {/* Destination preview */}
              <div className="pt-2 pb-1 flex items-center justify-between">
                <div>
                  <p className={cn("text-[11px] font-semibold uppercase tracking-wider", isDark ? "text-teal/90" : "text-teal")}>Smart City Cooling Hub</p>
                  <p className={cn("text-sm font-bold truncate", isDark ? "text-white" : "text-charcoal")}>{shelter.name}</p>
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0", isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-black/[0.03] border-black/[0.06] text-muted")}>
                  WBGT Model
                </span>
              </div>

              {/* Standard route */}
              <div className={cn(
                "p-4 rounded-2xl border",
                isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber/[0.06] border-amber/10"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-500">
                    Standard Route (Vehicular Speed Only)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className={cn("w-3.5 h-3.5", isDark ? "text-white/40" : "text-muted")} />
                      <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-charcoal")}>
                        11 min
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-amber-500 font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    High thermal radiation (100%)
                  </span>
                </div>
              </div>

              {/* Shade-optimized route */}
              <div className={cn(
                "p-4 rounded-2xl border ring-1 ring-teal/30",
                isDark ? "bg-teal/15 border-teal/30" : "bg-teal/[0.08] border-teal/20"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-teal" />
                    <span className="text-sm font-bold text-teal">
                      AI Canopy & Shadow Route
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal text-white">
                    Pareto-Optimal
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className={cn("w-3.5 h-3.5", isDark ? "text-white/40" : "text-muted")} />
                      <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-charcoal")}>
                        14 min
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-teal font-bold px-2.5 py-1 rounded-lg bg-teal/15 border border-teal/25">
                    -40% Direct Heat Exposure
                  </span>
                </div>
              </div>

              <p className={cn("text-[11px] text-center pt-1", isDark ? "text-white/50" : "text-muted")}>
                AI solar azimuth & microclimate cost weighting along tree canopy & flyover shade
              </p>

              {/* Start in-app routing */}
              <button
                onClick={() => onStartInAppRouting(shelter)}
                className={cn(
                  "w-full flex items-center justify-center gap-2",
                  "px-5 py-3.5 rounded-2xl mt-2 shadow-md",
                  "bg-teal text-white font-bold text-[14px]",
                  "hover:bg-teal/90 transition-all duration-200",
                  "active:scale-[0.97]"
                )}
              >
                <TreePine className="w-4 h-4" />
                Start AI Live Navigation
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

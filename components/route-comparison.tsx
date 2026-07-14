"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, TreePine, Clock, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shelter } from "@/data/shelters";

interface RouteComparisonProps {
  shelter: Shelter | null;
  onClose: () => void;
  onStartInAppRouting: (shelter: Shelter) => void;
}

export function RouteComparison({
  shelter,
  onClose,
  onStartInAppRouting,
}: RouteComparisonProps) {
  if (!shelter) return null;

  return (
    <AnimatePresence>
      {shelter && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1000]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 280,
            }}
            className={cn(
              "fixed bottom-6 left-4 right-4 z-[1001]",
              "md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
              "md:max-w-md md:w-full",
              "bg-white rounded-3xl",
              "shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
              "overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-teal" strokeWidth={2} />
                <h3 className="text-lg font-bold text-charcoal">
                  Route Options
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/[0.05] flex items-center justify-center hover:bg-black/[0.08] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-muted" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-3">
              {/* Standard route */}
              <div className="p-4 rounded-2xl bg-amber/[0.06] border border-amber/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-amber" />
                  <span className="text-sm font-semibold text-amber">
                    Standard Direct Route
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted" />
                      <span className="text-sm text-charcoal font-medium">
                        12 min
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-amber font-medium px-2 py-1 rounded-lg bg-amber/10">
                    High sun exposure
                  </span>
                </div>
              </div>

              {/* Shade-optimized route */}
              <div className="p-4 rounded-2xl bg-teal/[0.06] border border-teal/10">
                <div className="flex items-center gap-2 mb-2">
                  <TreePine className="w-4 h-4 text-teal" />
                  <span className="text-sm font-semibold text-teal">
                    Shade-Optimized Route
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted" />
                      <span className="text-sm text-charcoal font-medium">
                        15 min
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-teal font-medium px-2 py-1 rounded-lg bg-teal/10">
                    40% less direct sun
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted text-center pt-1">
                Live in-app navigation calculated along shaded corridors
              </p>

              {/* Start in-app routing */}
              <button
                onClick={() => onStartInAppRouting(shelter)}
                className={cn(
                  "w-full flex items-center justify-center gap-2",
                  "px-5 py-3.5 rounded-2xl mt-2",
                  "bg-teal text-white font-semibold text-[15px]",
                  "hover:bg-teal/90 transition-all duration-200",
                  "active:scale-[0.97]"
                )}
              >
                <TreePine className="w-4 h-4" />
                Start In-App Live Route
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

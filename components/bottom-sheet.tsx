"use client";

import { motion, useDragControls, PanInfo } from "framer-motion";
import { useState, useRef } from "react";
import { Locate } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  children: React.ReactNode;
  title?: string;
  count?: number;
  isDark?: boolean;
  onLocate?: () => void;
  isLocating?: boolean;
}

export function BottomSheet({
  children,
  title,
  count,
  isDark = false,
  onLocate,
  isLocating = false,
}: BottomSheetProps) {
  const [snapPoint, setSnapPoint] = useState<"peek" | "half" | "full">("peek");
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Smooth Google Maps snap heights
  const snapHeights = {
    peek: "185px",
    half: "55vh",
    full: "90vh",
  };

  // Ultra-responsive Google Maps drag thresholds
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 150 || offset > 40) {
      // Swiping downward
      if (snapPoint === "full") setSnapPoint("half");
      else setSnapPoint("peek");
    } else if (velocity < -150 || offset < -40) {
      // Swiping upward
      if (snapPoint === "peek") setSnapPoint("half");
      else setSnapPoint("full");
    }
  };

  const toggleSnap = () => {
    if (snapPoint === "peek") setSnapPoint("half");
    else if (snapPoint === "half") setSnapPoint("full");
    else setSnapPoint("peek");
  };

  return (
    <div ref={constraintsRef} className="fixed bottom-0 left-0 right-0 z-[500] pointer-events-none">
      <motion.div
        animate={{
          height: snapHeights[snapPoint],
        }}
        transition={{
          type: "spring",
          damping: 24,
          stiffness: 320,
          mass: 0.6,
        }}
        drag="y"
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        className={cn(
          "pointer-events-auto flex flex-col overflow-hidden transition-colors duration-300 relative",
          "rounded-t-3xl shadow-[0_-6px_36px_rgba(0,0,0,0.18)] border-t",
          isDark
            ? "bg-[#181d28] text-white border-white/10"
            : "bg-white text-charcoal border-black/[0.05]"
        )}
      >
        {/* Drag handle area with tap-to-toggle */}
        <div
          onClick={toggleSnap}
          className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0 group select-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className={cn("w-10 h-1.5 rounded-full transition-all group-hover:scale-x-110", isDark ? "bg-white/30" : "bg-black/20")} />
        </div>

        {/* Title bar */}
        {title && (
          <div
            onClick={toggleSnap}
            className="px-5 pb-3 flex items-center justify-between shrink-0 cursor-pointer select-none"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <h2 className={cn("text-base font-bold", isDark ? "text-white" : "text-charcoal")}>{title}</h2>

            <div className="flex items-center gap-2 shrink-0">
              {count !== undefined && (
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full",
                    isDark ? "bg-white/10 text-white/90" : "bg-black/[0.05] text-charcoal"
                  )}
                >
                  {count} nearby
                </span>
              )}

              {/* Blue Geolocation trigger FAB */}
              {onLocate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLocate();
                  }}
                  disabled={isLocating}
                  title="Locate Me"
                  className={cn(
                    "p-2 rounded-full bg-blue-600 text-white shadow-sm shrink-0",
                    "hover:bg-blue-700 transition-all duration-200 active:scale-[0.92]",
                    isLocating && "opacity-70"
                  )}
                >
                  {isLocating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Locate className="w-4 h-4" strokeWidth={2} />
                    </motion.div>
                  ) : (
                    <Locate className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Smooth continuous scrollable shelter list */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2.5 scrollbar-none">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

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

  // Heights for each snap point
  const snapHeights = {
    peek: "180px",
    half: "50vh",
    full: "85vh",
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 500 || offset > 100) {
      // Swipe down
      if (snapPoint === "full") setSnapPoint("half");
      else setSnapPoint("peek");
    } else if (velocity < -500 || offset < -100) {
      // Swipe up
      if (snapPoint === "peek") setSnapPoint("half");
      else setSnapPoint("full");
    }
  };

  return (
    <div ref={constraintsRef} className="fixed bottom-0 left-0 right-0 z-[500] pointer-events-none">
      <motion.div
        animate={{
          height: snapHeights[snapPoint],
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
        }}
        drag="y"
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className={cn(
          "pointer-events-auto flex flex-col overflow-hidden transition-colors duration-300 relative",
          "rounded-t-3xl shadow-[0_-4px_40px_rgba(0,0,0,0.18)]",
          isDark
            ? "bg-[#181d28] text-white border-t border-white/10"
            : "bg-white text-charcoal border-t border-black/[0.04]"
        )}
      >
        {/* Handle */}
        <div
          className="flex flex-col items-center pt-2.5 pb-2 cursor-grab active:cursor-grabbing shrink-0"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className={cn("w-9 h-1 rounded-full", isDark ? "bg-white/20" : "bg-black/10")} />
        </div>

        {/* Title bar with Locate Me button & count badge grouped on right */}
        {title && (
          <div className="px-5 pb-3 flex items-center justify-between shrink-0">
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
                  onClick={onLocate}
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2.5">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

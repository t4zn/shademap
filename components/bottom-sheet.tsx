"use client";

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
  const dragStartYRef = useRef<number | null>(null);

  // Smooth CSS-driven Google Maps snap heights
  const snapHeights = {
    peek: "185px",
    half: "55vh",
    full: "90vh",
  };

  const toggleSnap = () => {
    if (snapPoint === "peek") setSnapPoint("half");
    else if (snapPoint === "half") setSnapPoint("full");
    else setSnapPoint("peek");
  };

  // Ultra-fast lightweight touch/drag gesture handler without heavy JS animation frame loops
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartYRef.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const diff = dragStartYRef.current - endY;
    dragStartYRef.current = null;

    if (diff > 40) {
      // Swiped Up
      if (snapPoint === "peek") setSnapPoint("half");
      else if (snapPoint === "half") setSnapPoint("full");
    } else if (diff < -40) {
      // Swiped Down
      if (snapPoint === "full") setSnapPoint("half");
      else if (snapPoint === "half") setSnapPoint("peek");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[500] pointer-events-none">
      <div
        style={{ height: snapHeights[snapPoint] }}
        className={cn(
          "pointer-events-auto flex flex-col overflow-hidden relative border-t",
          "rounded-t-3xl shadow-[0_-6px_36px_rgba(0,0,0,0.18)]",
          "transition-[height] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
          isDark
            ? "bg-[#181d28] text-white border-white/10"
            : "bg-white text-charcoal border-black/[0.05]"
        )}
      >
        {/* Touch & drag header bar */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={toggleSnap}
          className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0 group select-none"
        >
          <div className={cn("w-10 h-1.5 rounded-full transition-all group-hover:scale-x-110", isDark ? "bg-white/30" : "bg-black/20")} />
        </div>

        {/* Title bar */}
        {title && (
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={toggleSnap}
            className="px-5 pb-3 flex items-center justify-between shrink-0 cursor-pointer select-none"
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Locate className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* High-performance scrollable shelter list */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2.5 scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
}

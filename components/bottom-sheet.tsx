"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Locate } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  children: React.ReactNode;
  title?: string;
  count?: number;
  isDark?: boolean;
  onLocate?: () => void;
  isLocating?: boolean;
  hasActiveDetail?: boolean;
}

const MIN_HEIGHT = 185;
const MAX_HEIGHT_VH = 0.75; // 75vh max expanded
const DETAIL_HEIGHT_VH = 0.55;

export function BottomSheet({
  children,
  title,
  count,
  isDark = false,
  onLocate,
  isLocating = false,
  hasActiveDetail = false,
}: BottomSheetProps) {
  const [sheetHeightPx, setSheetHeightPx] = useState(MIN_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartHeightRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute pixel bounds
  const maxHeightPx = typeof window !== "undefined" ? window.innerHeight * MAX_HEIGHT_VH : 600;
  const detailHeightPx = typeof window !== "undefined" ? window.innerHeight * DETAIL_HEIGHT_VH : 400;

  // Lock to detail height when shelter detail is open
  useEffect(() => {
    if (hasActiveDetail) {
      setSheetHeightPx(detailHeightPx);
    }
  }, [hasActiveDetail, detailHeightPx]);

  // Snap to nearest clean position on drag end
  const snapToNearest = useCallback(
    (currentHeight: number, velocity: number) => {
      // If velocity is strong enough, snap in the swipe direction
      if (velocity > 300) {
        setSheetHeightPx(MIN_HEIGHT);
        return;
      }
      if (velocity < -300) {
        setSheetHeightPx(maxHeightPx);
        return;
      }

      // Otherwise snap to nearest boundary
      const midPoint = (MIN_HEIGHT + maxHeightPx) / 2;
      setSheetHeightPx(currentHeight > midPoint ? maxHeightPx : MIN_HEIGHT);
    },
    [maxHeightPx]
  );

  // ─── Touch handlers ───
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (hasActiveDetail) return;
      setIsDragging(true);
      dragStartYRef.current = e.touches[0].clientY;
      dragStartHeightRef.current = sheetHeightPx;
    },
    [hasActiveDetail, sheetHeightPx]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || hasActiveDetail) return;
      const deltaY = dragStartYRef.current - e.touches[0].clientY;
      const newHeight = Math.min(maxHeightPx, Math.max(MIN_HEIGHT, dragStartHeightRef.current + deltaY));
      setSheetHeightPx(newHeight);
    },
    [isDragging, hasActiveDetail, maxHeightPx]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || hasActiveDetail) return;
      setIsDragging(false);
      const endY = e.changedTouches[0].clientY;
      const velocity = endY - dragStartYRef.current; // positive = swiped down
      const elapsed = 1; // approximate
      snapToNearest(sheetHeightPx, velocity / elapsed);
    },
    [isDragging, hasActiveDetail, sheetHeightPx, snapToNearest]
  );

  // ─── Mouse handlers (desktop drag) ───
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (hasActiveDetail) return;
      e.preventDefault();
      setIsDragging(true);
      dragStartYRef.current = e.clientY;
      dragStartHeightRef.current = sheetHeightPx;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = dragStartYRef.current - moveEvent.clientY;
        const newHeight = Math.min(maxHeightPx, Math.max(MIN_HEIGHT, dragStartHeightRef.current + deltaY));
        setSheetHeightPx(newHeight);
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        setIsDragging(false);
        const velocity = upEvent.clientY - dragStartYRef.current;
        const currentH = Math.min(maxHeightPx, Math.max(MIN_HEIGHT, dragStartHeightRef.current + (dragStartYRef.current - upEvent.clientY)));
        snapToNearest(currentH, velocity);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [hasActiveDetail, sheetHeightPx, maxHeightPx, snapToNearest]
  );

  // Click to toggle (fallback for simple taps)
  const handleClick = useCallback(() => {
    if (hasActiveDetail) return;
    if (sheetHeightPx > MIN_HEIGHT + 20) {
      setSheetHeightPx(MIN_HEIGHT);
    } else {
      setSheetHeightPx(maxHeightPx);
    }
  }, [hasActiveDetail, sheetHeightPx, maxHeightPx]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[500] pointer-events-none flex justify-center">
      <div
        ref={containerRef}
        style={{ height: hasActiveDetail ? `${detailHeightPx}px` : `${sheetHeightPx}px` }}
        className={cn(
          "pointer-events-auto w-full md:max-w-xl flex flex-col overflow-hidden relative border-t",
          "rounded-t-3xl md:rounded-3xl shadow-[0_-6px_36px_rgba(0,0,0,0.18)] md:mb-3",
          // Only apply smooth transition when NOT actively dragging
          !isDragging && "transition-[height] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
          isDark
            ? "bg-[#181d28] text-white border-white/10"
            : "bg-white text-charcoal border-black/[0.05]"
        )}
      >
        {/* Draggable handle bar — works on touch AND mouse */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          className={cn(
            "flex flex-col items-center pt-2.5 pb-1.5 shrink-0 group select-none",
            hasActiveDetail ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          )}
        >
          <div className={cn("w-10 h-1.5 rounded-full transition-all group-hover:scale-x-110", isDark ? "bg-white/30" : "bg-black/20")} />
        </div>

        {/* Header Title Bar (Only displayed in list view; hidden when active detail is open) */}
        {!hasActiveDetail && title && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            className="px-5 pb-3 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing select-none"
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
                  onMouseDown={(e) => e.stopPropagation()}
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

        {/* Scrollable content container */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2.5 scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SunMedium } from "lucide-react";

type HeatLevel = "moderate" | "high" | "critical";

interface HeatConfig {
  label: string;
  color: string;
  trackColor: string;
  bgColor: string;
  percentage: number;
}

const HEAT_LEVELS: Record<HeatLevel, HeatConfig> = {
  moderate: {
    label: "Moderate",
    percentage: 42,
    color: "#f59e0b",
    trackColor: "rgba(245, 158, 11, 0.15)",
    bgColor: "rgba(245, 158, 11, 0.06)",
  },
  high: {
    label: "High",
    percentage: 75,
    color: "#ef4444",
    trackColor: "rgba(239, 68, 68, 0.15)",
    bgColor: "rgba(239, 68, 68, 0.06)",
  },
  critical: {
    label: "Critical",
    percentage: 92,
    color: "#dc2626",
    trackColor: "rgba(220, 38, 38, 0.15)",
    bgColor: "rgba(220, 38, 38, 0.06)",
  },
};

export function HeatDebtWidget() {
  // Static clean demo state representing current shift exposure
  const config = HEAT_LEVELS["moderate"];

  // SVG radial progress
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - config.percentage / 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={cn(
        "frosted-glass rounded-2xl p-3.5",
        "border border-black/[0.06]",
        "shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        "w-[170px]"
      )}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Radial progress ring */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              stroke={config.trackColor}
              strokeWidth="5"
            />
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              stroke={config.color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-sm font-bold leading-none"
              style={{ color: config.color }}
            >
              {config.percentage}%
            </span>
          </div>
        </div>

        {/* Status label */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted mb-0.5">
            <SunMedium className="w-3 h-3 text-amber" />
            <span className="text-[11px] font-medium">Shift Heat Exposure</span>
          </div>
          <p className="text-xs font-semibold" style={{ color: config.color }}>
            {config.label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

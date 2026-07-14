"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  suffix = "",
  label,
  duration = 2,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const durationMs = duration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease-out cubic for a satisfying deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(easedProgress * value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  const formatValue = (v: number): string => {
    if (value >= 1_000_000_000) {
      return v >= 1_000_000_000
        ? `${(v / 1_000_000_000).toFixed(v / 1_000_000_000 >= 100 ? 0 : 1)}`
        : `${(v / 1_000_000_000).toFixed(1)}`;
    }
    if (value >= 1_000_000) {
      return `${(v / 1_000_000).toFixed(1)}`;
    }
    if (value >= 100) {
      return Math.round(v).toString();
    }
    return v.toFixed(1);
  };

  const getUnitSuffix = (): string => {
    if (value >= 1_000_000_000) return "B";
    if (value >= 1_000_000) return "M";
    return "";
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center"
    >
      <div className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-charcoal">
        {formatValue(displayValue)}
        <span className="text-teal">{getUnitSuffix()}</span>
        {suffix && <span className="text-amber">{suffix}</span>}
      </div>
      <p className="mt-3 text-base md:text-lg text-muted max-w-xs mx-auto leading-relaxed">
        {label}
      </p>
    </motion.div>
  );
}

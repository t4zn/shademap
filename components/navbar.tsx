"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Building2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Rider Map" },
  { href: "/partner", label: "Partnership" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "frosted-glass",
        "border-b border-black/[0.06]"
      )}
    >
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-amber flex items-center justify-center">
            <Sun className="w-4.5 h-4.5 text-white" strokeWidth={2} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-charcoal">
            ShadeMap
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium",
              "text-muted hover:text-charcoal flex items-center gap-1.5",
              "transition-colors duration-200"
            )}
          >
            <MapPin className="w-3.5 h-3.5" />
            Rider Map
          </Link>
          <Link
            href="/partner"
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold",
              "bg-teal text-white flex items-center gap-1.5",
              "hover:bg-teal/90 transition-all duration-200",
              "active:scale-[0.97]"
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            Partnership Dashboard
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-black/[0.04] transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="w-5 h-5 text-charcoal" />
          ) : (
            <Menu className="w-5 h-5 text-charcoal" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:hidden overflow-hidden frosted-glass border-b border-black/[0.06]"
          >
            <div className="px-6 py-4 space-y-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-xl text-base font-medium",
                  "text-muted hover:text-charcoal hover:bg-black/[0.03]",
                  "transition-all duration-200"
                )}
              >
                Rider Map
              </Link>
              <Link
                href="/partner"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-xl text-base font-semibold text-center",
                  "bg-teal text-white",
                  "active:scale-[0.97] transition-all duration-200"
                )}
              >
                Partnership Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

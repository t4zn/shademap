"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Check,
  Building2,
  Droplets,
  Armchair,
  Snowflake,
  DoorOpen,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShelterType } from "@/data/shelters";

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

interface SubmittedPoint {
  id: string;
  name: string;
  address: string;
  lat: string;
  lng: string;
  type: ShelterType;
  amenities: {
    water: boolean;
    seating: boolean;
    ac: boolean;
    restroom: boolean;
  };
  contact: string;
  hours: string;
  verified: boolean;
  createdAt: string;
}

const STORAGE_KEY = "shademap-partner-points";

function loadPoints(): SubmittedPoint[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePoints(points: SubmittedPoint[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
}

const AMENITY_OPTIONS = [
  { key: "water" as const, icon: Droplets, label: "Drinking Water" },
  { key: "seating" as const, icon: Armchair, label: "Shaded Seating" },
  { key: "ac" as const, icon: Snowflake, label: "Air Conditioning" },
  { key: "restroom" as const, icon: DoorOpen, label: "Restroom Access" },
];

const TYPE_OPTIONS: { value: ShelterType; label: string; desc: string }[] = [
  { value: "platform", label: "Platform Partner", desc: "Zomato, Swiggy, Blinkit, Zepto" },
  { value: "municipal", label: "Civic Body", desc: "Municipal & urban heat relief spot" },
  { value: "community", label: "Community", desc: "Local store, petrol pump, sponsor" },
];

export function PartnerModal({ isOpen, onClose, isDark = false }: PartnerModalProps) {
  const [points, setPoints] = useState<SubmittedPoint[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [type, setType] = useState<ShelterType>("community");
  const [amenities, setAmenities] = useState({
    water: false,
    seating: false,
    ac: false,
    restroom: false,
  });
  const [contact, setContact] = useState("");
  const [hours, setHours] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPoints(loadPoints());
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Location name is required");
    if (!address.trim()) errors.push("Address is required");
    if (!lat.trim() || isNaN(Number(lat))) errors.push("Valid latitude required");
    if (!lng.trim() || isNaN(Number(lng))) errors.push("Valid longitude required");
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newPoint: SubmittedPoint = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      address: address.trim(),
      lat: lat.trim(),
      lng: lng.trim(),
      type,
      amenities,
      contact: contact.trim(),
      hours: hours.trim(),
      verified: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newPoint, ...points];
    setPoints(updated);
    savePoints(updated);

    // Reset form
    setName("");
    setAddress("");
    setLat("");
    setLng("");
    setType("community");
    setAmenities({ water: false, seating: false, ac: false, restroom: false });
    setContact("");
    setHours("");
    setFormErrors([]);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleAmenity = (key: keyof typeof amenities) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Apple-style translucent blurred overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[1000]"
          />

          {/* Authentic iOS / macOS Sheet Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className={cn(
              "fixed z-[1001] rounded-[24px] overflow-hidden",
              "top-[10%] bottom-[10%] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:max-h-[70vh]",
              "flex flex-col border transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.35)]",
              isDark
                ? "bg-[#1c222e]/95 backdrop-blur-2xl border-white/15 text-white"
                : "bg-white/95 backdrop-blur-2xl border-black/10 text-charcoal"
            )}
          >
            {/* Apple macOS style header bar with title & Done button */}
            <div
              className={cn(
                "px-5 py-3.5 border-b flex items-center justify-between shrink-0 select-none",
                isDark ? "border-white/10 bg-[#1c222e]/80" : "border-black/[0.06] bg-slate-50/80"
              )}
            >
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-lg transition-colors",
                  isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-muted hover:text-charcoal hover:bg-black/5"
                )}
              >
                Cancel
              </button>

              <div className="text-center">
                <h3 className={cn("text-sm font-bold tracking-tight", isDark ? "text-white" : "text-charcoal")}>
                  Partner Rest Point
                </h3>
                <p className={cn("text-[10px] font-medium opacity-60")}>Apple Certified Submission</p>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="text-xs font-bold text-teal px-2.5 py-1 rounded-full bg-teal/10 hover:bg-teal/20 transition-all active:scale-95"
              >
                Add Point
              </button>
            </div>

            {/* Apple Grouped List Form Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-none">
              {/* Validation Messages */}
              {formErrors.length > 0 && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1">
                  {formErrors.map((err, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-red-500">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {err}
                    </div>
                  ))}
                </div>
              )}

              {showSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  Rest point registered successfully!
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* iOS Grouped Section 1: Location Identification */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted/80 mb-1.5 px-1">
                    Location Details
                  </label>
                  <div
                    className={cn(
                      "rounded-2xl border overflow-hidden divide-y",
                      isDark
                        ? "bg-[#252c3c] border-white/10 divide-white/10"
                        : "bg-black/[0.03] border-black/[0.06] divide-black/[0.06]"
                    )}
                  >
                    {/* Location Name row */}
                    <div className="px-3.5 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-medium shrink-0 w-24">Name</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. HP Petrol Pump Rest Canopy"
                        className={cn(
                          "w-full text-xs font-medium bg-transparent text-right focus:outline-none",
                          isDark ? "text-white placeholder:text-white/30" : "text-charcoal placeholder:text-muted/40"
                        )}
                      />
                    </div>

                    {/* Address row */}
                    <div className="px-3.5 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-medium shrink-0 w-24">Address</span>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, Landmark, City"
                        className={cn(
                          "w-full text-xs font-medium bg-transparent text-right focus:outline-none",
                          isDark ? "text-white placeholder:text-white/30" : "text-charcoal placeholder:text-muted/40"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* iOS Grouped Section 2: Coordinates */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted/80 mb-1.5 px-1">
                    Geo Coordinates
                  </label>
                  <div
                    className={cn(
                      "rounded-2xl border overflow-hidden divide-y grid grid-cols-2",
                      isDark
                        ? "bg-[#252c3c] border-white/10 divide-white/10"
                        : "bg-black/[0.03] border-black/[0.06] divide-black/[0.06]"
                    )}
                  >
                    <div className="px-3.5 py-2.5 flex items-center justify-between border-r border-inherit">
                      <span className="text-xs font-medium shrink-0">Lat</span>
                      <input
                        type="text"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder="22.7196"
                        className={cn(
                          "w-full text-xs font-medium bg-transparent text-right focus:outline-none",
                          isDark ? "text-white placeholder:text-white/30" : "text-charcoal placeholder:text-muted/40"
                        )}
                      />
                    </div>
                    <div className="px-3.5 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-medium shrink-0">Lng</span>
                      <input
                        type="text"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        placeholder="75.8577"
                        className={cn(
                          "w-full text-xs font-medium bg-transparent text-right focus:outline-none",
                          isDark ? "text-white placeholder:text-white/30" : "text-charcoal placeholder:text-muted/40"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* iOS Grouped Section 3: Partner Category */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted/80 mb-1.5 px-1">
                    Partner Category
                  </label>
                  <div
                    className={cn(
                      "rounded-2xl border overflow-hidden divide-y",
                      isDark
                        ? "bg-[#252c3c] border-white/10 divide-white/10"
                        : "bg-black/[0.03] border-black/[0.06] divide-black/[0.06]"
                    )}
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        className={cn(
                          "w-full px-3.5 py-2.5 flex items-center justify-between transition-colors text-left",
                          type === opt.value
                            ? isDark
                              ? "bg-teal/20"
                              : "bg-teal/10"
                            : "hover:bg-black/[0.02]"
                        )}
                      >
                        <div>
                          <p className={cn("text-xs font-semibold", type === opt.value && "text-teal")}>
                            {opt.label}
                          </p>
                          <p className={cn("text-[10px]", isDark ? "text-white/50" : "text-muted")}>
                            {opt.desc}
                          </p>
                        </div>
                        {type === opt.value && <Check className="w-4 h-4 text-teal shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* iOS Grouped Section 4: Available Amenities (iOS Switch Rows) */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted/80 mb-1.5 px-1">
                    Shelter Facilities
                  </label>
                  <div
                    className={cn(
                      "rounded-2xl border overflow-hidden divide-y",
                      isDark
                        ? "bg-[#252c3c] border-white/10 divide-white/10"
                        : "bg-black/[0.03] border-black/[0.06] divide-black/[0.06]"
                    )}
                  >
                    {AMENITY_OPTIONS.map(({ key, icon: Icon, label }) => (
                      <div
                        key={key}
                        onClick={() => toggleAmenity(key)}
                        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors hover:bg-black/[0.02]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={cn("p-1.5 rounded-lg", isDark ? "bg-white/10 text-white" : "bg-black/5 text-charcoal")}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-medium">{label}</span>
                        </div>

                        {/* Authentic iOS Toggle Switch */}
                        <div
                          className={cn(
                            "w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer",
                            amenities[key] ? "bg-teal" : isDark ? "bg-white/20" : "bg-black/15"
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out",
                              amenities[key] ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

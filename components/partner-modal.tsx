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
  { key: "water" as const, icon: Droplets, label: "Water" },
  { key: "seating" as const, icon: Armchair, label: "Seating" },
  { key: "ac" as const, icon: Snowflake, label: "AC" },
  { key: "restroom" as const, icon: DoorOpen, label: "Restroom" },
];

const TYPE_OPTIONS: { value: ShelterType; label: string; desc: string }[] = [
  { value: "platform", label: "Platform", desc: "Zomato, Swiggy, Amazon" },
  { value: "municipal", label: "Municipal", desc: "Govt / civic body" },
  { value: "community", label: "Community", desc: "Shop, station, sponsor" },
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

  const inputClass = cn(
    "w-full px-3.5 py-2.5 rounded-xl border transition-all duration-200 text-xs focus:outline-none",
    isDark
      ? "bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:ring-2 focus:ring-teal/40"
      : "bg-black/[0.03] border-black/[0.06] text-charcoal placeholder:text-muted/40 focus:ring-2 focus:ring-teal/20"
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
          />

          {/* Minimal Modal Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className={cn(
              "fixed z-[1001] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
              "top-[8%] bottom-[8%] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:max-h-[85vh]",
              "flex flex-col overflow-hidden border transition-colors duration-300",
              isDark
                ? "bg-[#181d28] border-white/10 text-white"
                : "bg-white border-black/[0.06] text-charcoal"
            )}
          >
            {/* Modal Header */}
            <div
              className={cn(
                "px-5 py-4 border-b flex items-center justify-between shrink-0",
                isDark ? "border-white/10 bg-[#181d28]" : "border-black/[0.06] bg-white"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-teal" />
                </div>
                <div>
                  <h3 className={cn("text-base font-bold leading-tight", isDark ? "text-white" : "text-charcoal")}>
                    Add Rest Point
                  </h3>
                  <p className={cn("text-xs", isDark ? "text-white/60" : "text-muted")}>
                    Submit verified shelter for delivery riders
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isDark ? "bg-white/10 hover:bg-white/15 text-white/80" : "bg-black/[0.05] hover:bg-black/[0.08] text-muted"
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Errors */}
              {formErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1">
                  {formErrors.map((err, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-red-500">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Success Notification */}
              {showSuccess && (
                <div className="p-3 rounded-xl bg-teal/10 border border-teal/20 flex items-center gap-2 text-xs font-semibold text-teal">
                  <Check className="w-4 h-4" />
                  Rest point submitted — pending verification!
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Location Name */}
                <div>
                  <label className={cn("block text-xs font-semibold mb-1", isDark ? "text-white" : "text-charcoal")}>
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. HP Petrol Bunk — Vijay Nagar"
                    className={inputClass}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className={cn("block text-xs font-semibold mb-1", isDark ? "text-white" : "text-charcoal")}>
                    Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, landmark"
                    className={inputClass}
                  />
                </div>

                {/* Lat & Lng */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={cn("block text-xs font-semibold mb-1", isDark ? "text-white" : "text-charcoal")}>
                      Latitude *
                    </label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="22.7196"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={cn("block text-xs font-semibold mb-1", isDark ? "text-white" : "text-charcoal")}>
                      Longitude *
                    </label>
                    <input
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="75.8577"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Type Selection */}
                <div>
                  <label className={cn("block text-xs font-semibold mb-1.5", isDark ? "text-white" : "text-charcoal")}>
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        className={cn(
                          "p-2 rounded-xl text-left border transition-all active:scale-[0.96]",
                          type === opt.value
                            ? "bg-teal text-white border-teal font-semibold"
                            : isDark
                            ? "bg-white/5 text-white/70 border-white/10"
                            : "bg-black/[0.02] text-muted border-black/[0.04]"
                        )}
                      >
                        <p className="text-xs font-bold leading-tight">{opt.label}</p>
                        <p className="text-[10px] opacity-70 mt-0.5 truncate">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities Selection */}
                <div>
                  <label className={cn("block text-xs font-semibold mb-1.5", isDark ? "text-white" : "text-charcoal")}>
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {AMENITY_OPTIONS.map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleAmenity(key)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all active:scale-[0.96]",
                          amenities[key]
                            ? "bg-teal/20 text-teal border-teal/40 font-semibold"
                            : isDark
                            ? "bg-white/5 text-white/70 border-white/10"
                            : "bg-black/[0.02] text-muted border-black/[0.04]"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{label}</span>
                        </div>
                        {amenities[key] && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-teal text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-teal/90 transition-colors active:scale-[0.97]"
                >
                  <Plus className="w-4 h-4" />
                  Submit Rest Point
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

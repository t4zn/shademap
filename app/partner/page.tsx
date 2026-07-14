"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Check,
  Clock,
  Trash2,
  Droplets,
  Armchair,
  Snowflake,
  DoorOpen,
  ShieldCheck,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";
import type { ShelterType } from "@/data/shelters";

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
  { value: "platform", label: "Platform", desc: "Zomato, Swiggy, Amazon etc." },
  { value: "municipal", label: "Municipal", desc: "Govt / civic body run" },
  { value: "community", label: "Community", desc: "Shop, station, sponsor" },
];

export default function PartnerPage() {
  const [points, setPoints] = useState<SubmittedPoint[]>([]);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
    setPoints(loadPoints());
  }, []);

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
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const toggleVerified = (id: string) => {
    const updated = points.map((p) =>
      p.id === id ? { ...p, verified: !p.verified } : p
    );
    setPoints(updated);
    savePoints(updated);
  };

  const deletePoint = (id: string) => {
    const updated = points.filter((p) => p.id !== id);
    setPoints(updated);
    savePoints(updated);
  };

  const toggleAmenity = (key: keyof typeof amenities) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const verifiedCount = points.filter((p) => p.verified).length;
  const pendingCount = points.filter((p) => !p.verified).length;

  const inputClass = cn(
    "w-full px-4 py-3 rounded-2xl",
    "bg-black/[0.02] border border-black/[0.06]",
    "text-charcoal text-[15px] placeholder:text-muted/40",
    "focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal/30",
    "transition-all duration-200"
  );

  return (
    <>
      <Navbar />

      <main className="flex-1 pt-20 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* ── Header ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal/[0.08] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-teal" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs font-semibold text-teal uppercase tracking-widest">
                  Partner Dashboard
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal leading-tight">
                  Grow the shade network
                </h1>
              </div>
            </div>
            <p className="text-base text-muted max-w-2xl">
              Submit rest points for riders in your area. Each submission goes
              through verification before it appears on the map — ensuring every
              point riders see is genuine and safe.
            </p>
          </motion.div>

          {/* ── Stats bar ───────────────────────────────── */}
          {mounted && points.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 grid grid-cols-3 gap-3"
            >
              {[
                { label: "Total", value: points.length, color: "text-charcoal" },
                { label: "Verified", value: verifiedCount, color: "text-teal" },
                { label: "Pending", value: pendingCount, color: "text-amber" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04] text-center"
                >
                  <p className={cn("text-2xl font-bold", stat.color)}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ── Form (3 cols) ──────────────────────────── */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              onSubmit={handleSubmit}
              className={cn(
                "lg:col-span-3",
                "p-6 md:p-8 rounded-3xl",
                "bg-white border border-border-light",
                "shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.02)]"
              )}
            >
              <h2 className="text-lg font-bold text-charcoal mb-6">
                Submit a new rest point
              </h2>

              {/* Errors */}
              <AnimatePresence>
                {formErrors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-100"
                  >
                    {formErrors.map((err, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {err}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 p-3.5 rounded-2xl bg-teal/[0.06] border border-teal/10 flex items-center gap-2.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-teal" />
                    </div>
                    <span className="text-sm font-medium text-teal">
                      Rest point submitted — pending verification
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Location Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. HP Petrol Bunk — Vijay Nagar, Indore"
                    className={inputClass}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full street address"
                    className={inputClass}
                  />
                </div>

                {/* Lat/Lng */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Latitude <span className="text-red-400">*</span>
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
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Longitude <span className="text-red-400">*</span>
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

                {/* Type selector */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        className={cn(
                          "p-3 rounded-2xl text-left transition-all duration-200 active:scale-[0.97]",
                          "border",
                          type === opt.value
                            ? "bg-charcoal text-white border-charcoal"
                            : "bg-black/[0.02] text-muted border-black/[0.04] hover:bg-black/[0.04]"
                        )}
                      >
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            type === opt.value ? "text-white" : "text-charcoal"
                          )}
                        >
                          {opt.label}
                        </p>
                        <p
                          className={cn(
                            "text-[11px] mt-0.5",
                            type === opt.value ? "text-white/60" : "text-muted/60"
                          )}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Amenities available
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITY_OPTIONS.map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleAmenity(key)}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium",
                          "transition-all duration-200 active:scale-[0.97]",
                          "border",
                          amenities[key]
                            ? "bg-teal/[0.06] text-teal border-teal/15"
                            : "bg-black/[0.02] text-muted border-black/[0.04] hover:bg-black/[0.04]"
                        )}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.8} />
                        {label}
                        {amenities[key] && (
                          <Check className="w-3.5 h-3.5 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact & Hours */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Contact
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Phone or email"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1.5">
                      Hours
                    </label>
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="e.g. 9 AM – 9 PM"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "w-full flex items-center justify-center gap-2",
                    "px-6 py-4 rounded-2xl mt-1",
                    "bg-charcoal text-white text-[15px] font-semibold",
                    "hover:bg-charcoal-light transition-all duration-200"
                  )}
                >
                  <Plus className="w-4.5 h-4.5" />
                  Submit Rest Point
                </motion.button>
              </div>
            </motion.form>

            {/* ── Submitted list (2 cols) ───────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-charcoal">
                  Submitted Points
                </h2>
                {mounted && points.length > 0 && (
                  <span className="text-xs font-medium text-muted bg-black/[0.04] px-2.5 py-1 rounded-lg">
                    {points.length} total
                  </span>
                )}
              </div>

              {mounted && points.length === 0 ? (
                <div
                  className={cn(
                    "p-10 rounded-3xl text-center",
                    "bg-black/[0.015] border border-black/[0.04]"
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl bg-black/[0.03] flex items-center justify-center mx-auto mb-4">
                    <MapPin
                      className="w-7 h-7 text-muted/30"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="text-sm font-medium text-muted/60 mb-1">
                    No points yet
                  </p>
                  <p className="text-xs text-muted/40">
                    Submit a rest point using the form and it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {points.map((point) => (
                      <motion.div
                        key={point.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, x: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 250 }}
                        className={cn(
                          "p-4 rounded-2xl",
                          "bg-white border border-border-light",
                          "shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
                          "hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
                          "transition-shadow duration-200"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Status badge */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold",
                                  point.verified
                                    ? "bg-teal/10 text-teal"
                                    : "bg-amber/10 text-amber"
                                )}
                              >
                                {point.verified ? (
                                  <ShieldCheck className="w-3 h-3" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                {point.verified ? "Verified" : "Pending"}
                              </span>
                              <span className="text-[11px] text-muted/40">
                                {new Date(point.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>

                            <h3 className="text-[14px] font-semibold text-charcoal leading-snug">
                              {point.name}
                            </h3>
                            <p className="text-[12px] text-muted/60 mt-0.5 truncate">
                              {point.address}
                            </p>

                            {/* Amenity dots */}
                            <div className="flex items-center gap-1.5 mt-2">
                              {AMENITY_OPTIONS.map(({ key, icon: Icon }) =>
                                point.amenities[key] ? (
                                  <div
                                    key={key}
                                    className="w-6 h-6 rounded-lg bg-black/[0.03] flex items-center justify-center"
                                  >
                                    <Icon className="w-3 h-3 text-muted/50" strokeWidth={1.8} />
                                  </div>
                                ) : null
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              onClick={() => toggleVerified(point.id)}
                              className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-[0.9]",
                                point.verified
                                  ? "bg-teal/10 text-teal hover:bg-teal/20"
                                  : "bg-black/[0.03] text-muted/40 hover:bg-teal/10 hover:text-teal"
                              )}
                              title={
                                point.verified
                                  ? "Revoke verification"
                                  : "Mark as verified"
                              }
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletePoint(point.id)}
                              className="w-8 h-8 rounded-xl bg-black/[0.03] text-muted/30 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all duration-200 active:scale-[0.9]"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}

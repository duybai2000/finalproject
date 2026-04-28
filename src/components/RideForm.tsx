"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  User,
  LocateFixed,
  BriefcaseBusiness,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PickupMap = dynamic(() => import("@/components/PickupMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 rounded-xl border border-dashed border-white/15 bg-slate-950/30 grid place-items-center min-h-[480px] text-sm text-gray-500">
      Đang tải bản đồ...
    </div>
  ),
});

type PickupLocation = {
  lat: number;
  lng: number;
  accuracy: number | null;
};

type EstimateResult = {
  price: number;
  totalDays: number;
  surchargeDays: number;
  surchargeTotal: number;
  dailyRate: number;
  schedule: string;
  durationLabel: string;
};

export default function RideForm() {
  const [pickup, setPickup] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState<PickupLocation | null>(null);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const skipNextForwardGeocode = useRef(false);

  // Forward-geocode pickup text → recenter map. Debounced; skipped when the
  // text was set programmatically (map click, GPS) to avoid feedback loops.
  useEffect(() => {
    if (skipNextForwardGeocode.current) {
      skipNextForwardGeocode.current = false;
      return;
    }
    if (pickup.trim().length < 5) return;

    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geocode/forward?q=${encodeURIComponent(pickup)}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          results?: Array<{ lat: number; lng: number; address: string }>;
        };
        const top = data?.results?.[0];
        if (top) {
          setPickupLocation({ lat: top.lat, lng: top.lng, accuracy: null });
        }
      } catch {
        // aborted or network — ignore
      }
    }, 600);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [pickup]);

  const handleMapPick = ({
    lat,
    lng,
    address,
  }: {
    lat: number;
    lng: number;
    address?: string;
  }) => {
    setError("");
    setPickupLocation({ lat, lng, accuracy: null });
    if (address) {
      skipNextForwardGeocode.current = true;
      setPickup(address);
      setLocationMessage(`Pickup set from map`);
    } else {
      setLocationMessage(
        `Selected: ${lat.toFixed(5)}, ${lng.toFixed(5)} (looking up address...)`
      );
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("This browser does not support geolocation.");
      return;
    }

    setError("");
    setLocationMessage("Getting current location...");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        };

        setPickupLocation(nextLocation);
        setLocationMessage(
          `Location captured: ${nextLocation.lat.toFixed(5)}, ${nextLocation.lng.toFixed(5)}`
        );

        try {
          const res = await fetch(
            `/api/geocode/reverse?lat=${nextLocation.lat}&lng=${nextLocation.lng}`
          );
          if (res.ok) {
            const data = (await res.json()) as { address?: string };
            if (data.address) {
              setPickup((currentPickup) => {
                if (currentPickup.trim()) return currentPickup;
                skipNextForwardGeocode.current = true;
                return data.address!;
              });
            }
          }
        } catch {
          // ignore — coords still set
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        const nextError =
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission denied."
            : "Could not get your current location.";

        setPickupLocation(null);
        setLocationMessage("");
        setError(nextError);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickup || !startDate || !endDate) {
      return;
    }

    setError("");
    setEstimate(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ride/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await res.json()
        : { error: "Server returned an unexpected response." };

      if (!res.ok) {
        setError(data.error || "Could not calculate the price.");
        return;
      }

      if (typeof data.price === "number") {
        setEstimate({
          price: data.price,
          totalDays: data.totalDays,
          surchargeDays: data.surchargeDays,
          surchargeTotal: data.surchargeTotal,
          dailyRate: data.dailyRate,
          schedule: data.schedule,
          durationLabel: data.durationLabel,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!estimate) return;

    setError("");
    setIsConfirming(true);

    try {
      const payload: Record<string, unknown> = {
        pickup,
        startDate,
        endDate,
      };

      if (pickupLocation) {
        payload.pickupLat = pickupLocation.lat;
        payload.pickupLng = pickupLocation.lng;
        payload.pickupAccuracy = pickupLocation.accuracy;
      }

      const res = await fetch("/api/ride", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await res.json()
        : { error: "Server returned an unexpected response." };

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Could not place the booking.");
        return;
      }

      if (data.id) {
        router.push(`/booking/ride/${data.id}`);
      }
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]"
    >
      <section className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Hire a Driver by the Day</h2>
        <p className="text-sm text-gray-400 mb-6">
          Base rate 1,000,000 VND/day. Saturdays, Sundays, and public holidays are surcharged 20%.
        </p>

        <form onSubmit={handleEstimate} className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Pickup address"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-400 px-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70 text-gray-300 text-sm font-medium py-2.5 px-4 rounded-xl border border-white/10 transition-colors"
          >
            <LocateFixed className="w-4 h-4" />
            {isLocating
              ? "Getting location..."
              : pickupLocation
                ? "Update GPS location"
                : "Use my current location (optional)"}
          </button>

          {locationMessage && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <p>{locationMessage}</p>
              {pickupLocation && pickupLocation.accuracy !== null && (
                <p className="mt-1 text-emerald-100/80">
                  GPS accuracy: ~{Math.round(pickupLocation.accuracy)} m
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="relative block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Start date</span>
              <Calendar className="absolute left-3 bottom-3.5 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => {
                  const value = e.target.value;
                  setStartDate(value);
                  if (endDate && endDate < value) {
                    setEndDate(value);
                  }
                }}
                className="w-full bg-white/5 border border-white/10 text-white [color-scheme:dark] px-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </label>

            <label className="relative block">
              <span className="mb-2 block text-sm font-medium text-gray-300">End date</span>
              <Calendar className="absolute left-3 bottom-3.5 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white [color-scheme:dark] px-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "Calculating..." : "Calculate Price"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {estimate !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="flex justify-between items-center text-white mb-3">
              <span className="text-gray-300">Total:</span>
              <span className="text-xl font-bold text-blue-400">
                {estimate.price.toLocaleString("en-US")} VND
              </span>
            </div>
            <div className="grid gap-2 text-sm text-gray-400">
              <p className="flex items-center gap-2">
                <BriefcaseBusiness className="w-4 h-4" />
                Daily rate: {estimate.dailyRate.toLocaleString("en-US")} VND/day
              </p>
              <p>Schedule: {estimate.schedule}</p>
              <p>Duration: {estimate.durationLabel}</p>
              <p>Weekend / holiday days: {estimate.surchargeDays}</p>
              {estimate.surchargeTotal > 0 && (
                <p>
                  Weekend / holiday surcharge: +
                  {estimate.surchargeTotal.toLocaleString("en-US")} VND
                </p>
              )}
            </div>
            {pickupLocation && (
              <p className="mt-3 text-xs text-gray-400">
                Saved coordinates: {pickupLocation.lat.toFixed(5)}, {pickupLocation.lng.toFixed(5)}
              </p>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isConfirming ? "Confirming..." : "Confirm Booking"}
            </button>
          </motion.div>
        )}
      </section>

      <section className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl shadow-xl min-h-[560px] flex flex-col">
        <div className="flex items-center justify-between gap-3 px-2 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Pickup map</h3>
            <p className="text-sm text-gray-400">
              Click anywhere on the map to set the pickup point — the address
              will auto-fill in the &quot;Pickup&quot; field.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
          <PickupMap
            marker={
              pickupLocation
                ? { lat: pickupLocation.lat, lng: pickupLocation.lng }
                : null
            }
            onPick={handleMapPick}
          />
        </div>
      </section>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  User,
  LocateFixed,
  ExternalLink,
  BriefcaseBusiness,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DESTINATIONS, findDestination } from "@/lib/destinations";

type PickupLocation = {
  lat: number;
  lng: number;
  accuracy: number | null;
};

type EstimateResult = {
  price: number;
  daysFare: number;
  distanceFee: number;
  distanceKm: number;
  totalDays: number;
  surchargeDays: number;
  surchargeTotal: number;
  dailyRate: number;
  perKmRate: number;
  schedule: string;
  durationLabel: string;
};

function buildMapEmbedUrl(lat: number, lng: number) {
  const offset = 0.008;
  const bbox = [
    (lng - offset).toFixed(6),
    (lat - offset).toFixed(6),
    (lng + offset).toFixed(6),
    (lat + offset).toFixed(6),
  ].join("%2C");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lng.toFixed(6)}`;
}

function buildOpenStreetMapUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lng.toFixed(6)}#map=16/${lat.toFixed(6)}/${lng.toFixed(6)}`;
}

export default function RideForm() {
  const [pickup, setPickup] = useState("");
  const [dropoffId, setDropoffId] = useState("");
  const dropoffDestination = useMemo(() => findDestination(dropoffId), [dropoffId]);
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

  const mapEmbedUrl = useMemo(() => {
    if (!pickupLocation) return null;
    return buildMapEmbedUrl(pickupLocation.lat, pickupLocation.lng);
  }, [pickupLocation]);

  const mapPageUrl = useMemo(() => {
    if (!pickupLocation) return null;
    return buildOpenStreetMapUrl(pickupLocation.lat, pickupLocation.lng);
  }, [pickupLocation]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Trinh duyet nay khong ho tro lay vi tri.");
      return;
    }

    setError("");
    setLocationMessage("Dang lay vi tri hien tai...");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        };

        setPickupLocation(nextLocation);
        setPickup((currentPickup) =>
          currentPickup.trim() ? currentPickup : "Vi tri hien tai"
        );
        setLocationMessage(
          `Da lay vi tri: ${nextLocation.lat.toFixed(5)}, ${nextLocation.lng.toFixed(5)}`
        );
        setIsLocating(false);
      },
      (geoError) => {
        const nextError =
          geoError.code === geoError.PERMISSION_DENIED
            ? "Ban da tu choi quyen vi tri."
            : "Khong lay duoc vi tri hien tai.";

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

    if (!pickup || !dropoffDestination || !startDate || !endDate) {
      return;
    }

    if (!pickupLocation) {
      setError("Hay bam Lay vi tri hien tai truoc khi dat xe.");
      return;
    }

    setError("");
    setEstimate(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ride/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          pickupLat: pickupLocation.lat,
          pickupLng: pickupLocation.lng,
          dropoffLat: dropoffDestination.lat,
          dropoffLng: dropoffDestination.lng,
        }),
      });

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await res.json()
        : { error: "Server dang tra ve dinh dang khong hop le." };

      if (!res.ok) {
        setError(data.error || "Khong the tinh gia thue tai xe.");
        return;
      }

      if (typeof data.price === "number") {
        setEstimate({
          price: data.price,
          daysFare: data.daysFare,
          distanceFee: data.distanceFee,
          distanceKm: data.distanceKm,
          totalDays: data.totalDays,
          surchargeDays: data.surchargeDays,
          surchargeTotal: data.surchargeTotal,
          dailyRate: data.dailyRate,
          perKmRate: data.perKmRate,
          schedule: data.schedule,
          durationLabel: data.durationLabel,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Khong the ket noi server. Vui long thu lai.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!pickupLocation || !estimate || !dropoffDestination) return;

    setError("");
    setIsConfirming(true);

    try {
      const res = await fetch("/api/ride", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup,
          dropoff: dropoffDestination.name,
          startDate,
          endDate,
          pickupLat: pickupLocation.lat,
          pickupLng: pickupLocation.lng,
          pickupAccuracy: pickupLocation.accuracy,
          dropoffLat: dropoffDestination.lat,
          dropoffLng: dropoffDestination.lng,
        }),
      });

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await res.json()
        : { error: "Server dang tra ve dinh dang khong hop le." };

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Khong the dat tai xe.");
        return;
      }

      if (data.id) {
        router.push(`/booking/ride/${data.id}`);
      }
    } catch (err) {
      console.error(err);
      setError("Khong the ket noi server. Vui long thu lai.");
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
        <h2 className="text-2xl font-bold text-white mb-2">Thue Tai Xe Theo Ngay</h2>
        <p className="text-sm text-gray-400 mb-6">
          Gia co ban 1.000.000 d/ngay + 8.000 d/km quang duong (Diem don -&gt; Diem den).
          Thu 7, Chu nhat va ngay le tinh them 20% phan tien ngay.
        </p>

        <form onSubmit={handleEstimate} className="space-y-4">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70 text-white font-medium py-3 px-4 rounded-xl border border-white/10 transition-colors"
          >
            <LocateFixed className="w-5 h-5" />
            {isLocating ? "Dang lay vi tri..." : "Lay vi tri hien tai"}
          </button>

          {locationMessage && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <p>{locationMessage}</p>
              {pickupLocation && pickupLocation.accuracy !== null && (
                <p className="mt-1 text-emerald-100/80">
                  Sai so GPS: ~{Math.round(pickupLocation.accuracy)} m
                </p>
              )}
            </div>
          )}

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Diem don"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-400 px-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              <MapPin className="w-5 h-5" />
            </div>
            <select
              value={dropoffId}
              onChange={(e) => setDropoffId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white px-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              required
            >
              <option value="" disabled>
                Chon diem den
              </option>
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-800">
                  {d.name} ({d.region})
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="relative block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Ngay bat dau</span>
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
              <span className="mb-2 block text-sm font-medium text-gray-300">Ngay ket thuc</span>
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
            {isLoading ? "Dang xu ly..." : "Tinh Gia Thue Tai Xe"}
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
              <span className="text-gray-300">Tong gia tai xe:</span>
              <span className="text-xl font-bold text-blue-400">
                {estimate.price.toLocaleString("vi-VN")} d
              </span>
            </div>
            <div className="grid gap-2 text-sm text-gray-400">
              <p className="flex items-center gap-2">
                <BriefcaseBusiness className="w-4 h-4" />
                Don gia: {estimate.dailyRate.toLocaleString("vi-VN")} d/ngay
                {" - "}
                {estimate.perKmRate.toLocaleString("vi-VN")} d/km
              </p>
              <p>Lich thue: {estimate.schedule}</p>
              <p>Thoi gian: {estimate.durationLabel}</p>
              <p>Khoang cach uoc tinh: {estimate.distanceKm.toFixed(1)} km</p>
              <div className="border-t border-white/10 mt-2 pt-2 grid gap-1">
                <p>Tien theo ngay: {estimate.daysFare.toLocaleString("vi-VN")} d</p>
                {estimate.surchargeTotal > 0 && (
                  <p>
                    Phu thu cuoi tuan/ngay le ({estimate.surchargeDays} ngay): +
                    {estimate.surchargeTotal.toLocaleString("vi-VN")} d
                  </p>
                )}
                <p>Tien quang duong: +{estimate.distanceFee.toLocaleString("vi-VN")} d</p>
              </div>
            </div>
            {pickupLocation && dropoffDestination && (
              <p className="mt-3 text-xs text-gray-400">
                {pickupLocation.lat.toFixed(4)},{pickupLocation.lng.toFixed(4)} -&gt;{" "}
                {dropoffDestination.name}
              </p>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isConfirming ? "Dang xac nhan..." : "Xac Nhan Dat Tai Xe"}
            </button>
          </motion.div>
        )}
      </section>

      <section className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl shadow-xl min-h-[560px] flex flex-col">
        <div className="flex items-center justify-between gap-3 px-2 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Vi tri hien tai</h3>
            <p className="text-sm text-gray-400">
              Ban do se hien sau khi trinh duyet lay duoc GPS.
            </p>
          </div>
          {mapPageUrl && (
            <a
              href={mapPageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
            >
              Mo lon
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {mapEmbedUrl && pickupLocation ? (
          <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
            <iframe
              title="Ban do vi tri hien tai"
              src={mapEmbedUrl}
              className="h-full min-h-[480px] w-full"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex-1 rounded-xl border border-dashed border-white/15 bg-slate-950/30 grid place-items-center px-6 text-center text-sm text-gray-400">
            <div className="space-y-2">
              <LocateFixed className="w-8 h-8 mx-auto text-gray-500" />
              <p>Chua co vi tri de hien ban do.</p>
              <p className="text-gray-500">Bam &quot;Lay vi tri hien tai&quot; de xem marker cua nguoi thue.</p>
            </div>
          </div>
        )}
      </section>
    </motion.div>
  );
}

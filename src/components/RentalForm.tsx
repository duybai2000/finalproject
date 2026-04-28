"use client";

import { motion } from "framer-motion";
import { Calendar, Car as CarIcon, Star, Users, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CarModel = {
  id: number;
  name: string;
  type: string;
  seats: number;
  auto: boolean;
  price: string;
  dailyRate: number;
  estimatedTotal: number | null;
  totalDays: number | null;
  surchargeDays: number;
  surchargeTotal: number;
  img: string;
  description: string | null;
  ratingAvg: number | null;
  ratingCount: number;
};

export default function RentalForm() {
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cars, setCars] = useState<CarModel[]>([]);
  const [error, setError] = useState("");
  const [bookingCarId, setBookingCarId] = useState<number | null>(null);
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const handleSelectCar = async (carId: number) => {
    if (!pickupDate || !returnDate) {
      setError("Please choose pickup and return dates first.");
      return;
    }

    setError("");
    setBookingCarId(carId);

    try {
      const res = await fetch("/api/rental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId, pickupDate, returnDate }),
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
        setError(data.error || "Could not book this car.");
        return;
      }

      if (data.id) {
        router.push(`/booking/rental/${data.id}`);
      }
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setBookingCarId(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();

    if (pickupDate) params.set("pickupDate", pickupDate);
    if (returnDate) params.set("returnDate", returnDate);

    const url = params.toString() ? `/api/cars?${params.toString()}` : "/api/cars";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCars(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load the car list.");
      });
  }, [pickupDate, returnDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto space-y-8"
    >
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
        <div className="grid w-full gap-4 md:grid-cols-2">
          <label className="relative block">
            <span className="mb-2 block text-sm font-medium text-gray-300">Pickup date</span>
            <Calendar className="absolute left-3 bottom-3.5 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={pickupDate}
              min={today}
              onChange={(e) => {
                const value = e.target.value;
                setPickupDate(value);
                if (returnDate && returnDate < value) {
                  setReturnDate(value);
                }
              }}
              className="w-full bg-white/5 border border-white/10 text-white [color-scheme:dark] px-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </label>

          <label className="relative block">
            <span className="mb-2 block text-sm font-medium text-gray-300">Return date</span>
            <Calendar className="absolute left-3 bottom-3.5 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={returnDate}
              min={pickupDate || today}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white [color-scheme:dark] px-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-300">
          <p>Total = daily rate × number of rental days.</p>
          <p>Saturdays, Sundays, and public holidays are surcharged 20%.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car, idx) => (
          <motion.div
            key={car.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-colors group"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={car.img}
                alt={car.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold text-white">{car.name}</h3>
                {car.ratingAvg !== null && (
                  <span className="flex items-center gap-1 text-sm text-amber-300 whitespace-nowrap">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {car.ratingAvg.toFixed(1)}
                    <span className="text-xs text-gray-400">({car.ratingCount})</span>
                  </span>
                )}
              </div>
              {car.description && (
                <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                  {car.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-300">
                <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                  <Users className="w-4 h-4" /> {car.seats} seats
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                  <Settings className="w-4 h-4" /> {car.auto ? "Automatic" : "Manual"}
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                  <CarIcon className="w-4 h-4" /> {car.type}
                </span>
              </div>
              <div className="mt-5 space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400">Daily rate</p>
                    <p className="text-lg font-bold text-blue-400">
                      {car.dailyRate.toLocaleString("en-US")} VND
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectCar(car.id)}
                    disabled={bookingCarId !== null}
                    className="bg-white/10 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                  >
                    {bookingCarId === car.id ? "Booking..." : "Book this car"}
                  </button>
                </div>

                {pickupDate && returnDate ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
                    <p className="font-medium text-white">
                      Total: {car.estimatedTotal?.toLocaleString("en-US")} VND
                    </p>
                    <p className="mt-1">{car.totalDays} day(s)</p>
                    <p>{car.surchargeDays} weekend / holiday day(s)</p>
                    {car.surchargeTotal > 0 && (
                      <p>Surcharge: +{car.surchargeTotal.toLocaleString("en-US")} VND</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Pick the dates above to see the total.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

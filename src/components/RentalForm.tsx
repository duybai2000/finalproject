"use client";

import { motion } from "framer-motion";
import { Calendar, Car as CarIcon, Users, Settings } from "lucide-react";
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
      setError("Vui long chon ngay nhan va ngay tra truoc khi chon xe.");
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
        : { error: "Server tra ve dinh dang khong hop le." };

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Khong the thue xe.");
        return;
      }

      if (data.id) {
        router.push(`/booking/rental/${data.id}`);
      }
    } catch (err) {
      console.error(err);
      setError("Khong the ket noi server. Vui long thu lai.");
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
        setError("Khong tai duoc bang gia xe.");
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
            <span className="mb-2 block text-sm font-medium text-gray-300">Ngay nhan</span>
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
            <span className="mb-2 block text-sm font-medium text-gray-300">Ngay tra</span>
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
          <p>Gia tinh theo so ngay thue va don gia tung loai xe.</p>
          <p>Thu 7, Chu nhat va ngay le duoc cong them 20% cho ngay do.</p>
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
              <h3 className="text-xl font-bold text-white">{car.name}</h3>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-300">
                <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                  <Users className="w-4 h-4" /> {car.seats} Cho
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                  <Settings className="w-4 h-4" /> {car.auto ? "Tu dong" : "So san"}
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                  <CarIcon className="w-4 h-4" /> {car.type}
                </span>
              </div>
              <div className="mt-5 space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400">Gia co ban moi ngay</p>
                    <p className="text-lg font-bold text-blue-400">
                      {car.dailyRate.toLocaleString("vi-VN")} d
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectCar(car.id)}
                    disabled={bookingCarId !== null}
                    className="bg-white/10 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                  >
                    {bookingCarId === car.id ? "Dang dat..." : "Chon Xe"}
                  </button>
                </div>

                {pickupDate && returnDate ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
                    <p className="font-medium text-white">
                      Tong thue: {car.estimatedTotal?.toLocaleString("vi-VN")} d
                    </p>
                    <p className="mt-1">{car.totalDays} ngay</p>
                    <p>{car.surchargeDays} ngay cuoi tuan/ngay le</p>
                    {car.surchargeTotal > 0 && (
                      <p>Phu thu: +{car.surchargeTotal.toLocaleString("vi-VN")} d</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Chon ngay nhan va ngay tra de xem tong gia.
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

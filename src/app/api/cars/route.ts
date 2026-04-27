import { NextResponse } from "next/server";
import { calculateCarRentalPrice } from "@/lib/pricing";

const CARS = [
  {
    id: 1,
    name: "Toyota Vios 2023",
    type: "Thuong",
    seats: 4,
    auto: true,
    dailyRate: 700_000,
    img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=400&h=250",
  },
  {
    id: 2,
    name: "Mazda 3 2024",
    type: "Cao cap",
    seats: 4,
    auto: true,
    dailyRate: 900_000,
    img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=400&h=250",
  },
  {
    id: 3,
    name: "Mitsubishi Xpander",
    type: "Gia dinh",
    seats: 7,
    auto: true,
    dailyRate: 1_000_000,
    img: "https://images.unsplash.com/photo-1629897048514-3dd7414cdfce?auto=format&fit=crop&q=80&w=400&h=250",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pickupDate = searchParams.get("pickupDate") || undefined;
  const returnDate = searchParams.get("returnDate") || undefined;

  const cars = CARS.map((car) => {
    const pricing = calculateCarRentalPrice(car.dailyRate, pickupDate, returnDate);

    return {
      ...car,
      price: car.dailyRate.toLocaleString("vi-VN"),
      estimatedTotal: pricing?.total ?? null,
      totalDays: pricing?.totalDays ?? null,
      surchargeDays: pricing?.surchargeDays ?? 0,
      surchargeTotal: pricing?.surchargeTotal ?? 0,
    };
  });

  return NextResponse.json(cars);
}

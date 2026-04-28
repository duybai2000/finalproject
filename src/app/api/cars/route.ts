import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateCarRentalPrice } from "@/lib/pricing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pickupDate = searchParams.get("pickupDate") || undefined;
  const returnDate = searchParams.get("returnDate") || undefined;

  const cars = await prisma.car.findMany({
    where: { active: true },
    orderBy: { id: "asc" },
  });

  const enriched = cars.map((car) => {
    const pricing = calculateCarRentalPrice(car.dailyRate, pickupDate, returnDate);

    return {
      id: car.id,
      name: car.name,
      type: car.type,
      seats: car.seats,
      auto: car.auto,
      dailyRate: car.dailyRate,
      img: car.img,
      price: car.dailyRate.toLocaleString("vi-VN"),
      estimatedTotal: pricing?.total ?? null,
      totalDays: pricing?.totalDays ?? null,
      surchargeDays: pricing?.surchargeDays ?? 0,
      surchargeTotal: pricing?.surchargeTotal ?? 0,
    };
  });

  return NextResponse.json(enriched);
}

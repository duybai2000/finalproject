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

  // Aggregate ratings: each rental can have one rating; rating belongs via
  // rental.carId. We compute per-car average + count in a single pass.
  const ratingsByCar = await prisma.rentalBooking.groupBy({
    by: ["carId"],
    where: { rating: { isNot: null } },
    _count: { _all: true },
  });
  const ratedCarIds = ratingsByCar.map((r) => r.carId);
  const ratings =
    ratedCarIds.length === 0
      ? []
      : await prisma.rating.findMany({
          where: { rental: { carId: { in: ratedCarIds } } },
          select: { score: true, rental: { select: { carId: true } } },
        });

  const aggregateByCar = new Map<number, { sum: number; count: number }>();
  for (const r of ratings) {
    const carId = r.rental?.carId;
    if (typeof carId !== "number") continue;
    const cur = aggregateByCar.get(carId) ?? { sum: 0, count: 0 };
    cur.sum += r.score;
    cur.count += 1;
    aggregateByCar.set(carId, cur);
  }

  const enriched = cars.map((car) => {
    const pricing = calculateCarRentalPrice(car.dailyRate, pickupDate, returnDate);
    const agg = aggregateByCar.get(car.id);
    return {
      id: car.id,
      name: car.name,
      type: car.type,
      seats: car.seats,
      auto: car.auto,
      dailyRate: car.dailyRate,
      img: car.img,
      description: car.description ?? null,
      price: car.dailyRate.toLocaleString("vi-VN"),
      estimatedTotal: pricing?.total ?? null,
      totalDays: pricing?.totalDays ?? null,
      surchargeDays: pricing?.surchargeDays ?? 0,
      surchargeTotal: pricing?.surchargeTotal ?? 0,
      ratingAvg: agg ? Math.round((agg.sum / agg.count) * 10) / 10 : null,
      ratingCount: agg?.count ?? 0,
    };
  });

  return NextResponse.json(enriched);
}

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  calculateDriverHirePrice,
  getDriverDailyRate,
  getPerKmRate,
} from "@/lib/pricing";

const EstimateSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay khong hop le."),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay khong hop le."),
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  dropoffLat: z.number().min(-90).max(90),
  dropoffLng: z.number().min(-180).max(180),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = EstimateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Du lieu khong hop le." },
        { status: 400 }
      );
    }

    const {
      startDate,
      endDate,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
    } = parsed.data;

    const pricing = calculateDriverHirePrice(
      startDate,
      endDate,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng
    );

    if (!pricing) {
      return NextResponse.json(
        { error: "Khoang thoi gian thue khong hop le." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      price: pricing.total,
      daysFare: pricing.daysFare,
      distanceFee: pricing.distanceFee,
      distanceKm: Math.round(pricing.distanceKm * 10) / 10,
      totalDays: pricing.totalDays,
      surchargeDays: pricing.surchargeDays,
      surchargeTotal: pricing.surchargeTotal,
      dailyRate: getDriverDailyRate(),
      perKmRate: getPerKmRate(),
      schedule: `${startDate} den ${endDate}`,
      durationLabel: `${pricing.totalDays} ngay`,
    });
  } catch {
    return NextResponse.json({ error: "Loi server." }, { status: 500 });
  }
}

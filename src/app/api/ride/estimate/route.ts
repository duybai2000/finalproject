import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateDriverHirePrice, getDriverDailyRate } from "@/lib/pricing";

const EstimateSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = EstimateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const { startDate, endDate } = parsed.data;
    const pricing = calculateDriverHirePrice(startDate, endDate);

    if (!pricing) {
      return NextResponse.json(
        { error: "Invalid rental period." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      price: pricing.total,
      totalDays: pricing.totalDays,
      surchargeDays: pricing.surchargeDays,
      surchargeTotal: pricing.surchargeTotal,
      dailyRate: getDriverDailyRate(),
      schedule: `${startDate} to ${endDate}`,
      durationLabel: `${pricing.totalDays} day${pricing.totalDays === 1 ? "" : "s"}`,
    });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

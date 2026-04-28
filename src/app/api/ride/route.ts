import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculateDriverHirePrice } from "@/lib/pricing";

const RideSchema = z.object({
  pickup: z.string().trim().min(1, "Vui long nhap diem don.").max(200),
  dropoff: z.string().trim().min(1, "Vui long chon diem den.").max(200),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay khong hop le."),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay khong hop le."),
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  pickupAccuracy: z.number().nonnegative().nullable().optional(),
  dropoffLat: z.number().min(-90).max(90),
  dropoffLng: z.number().min(-180).max(180),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui long dang nhap de dat xe." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = RideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Du lieu khong hop le." },
        { status: 400 }
      );
    }

    const {
      pickup,
      dropoff,
      startDate,
      endDate,
      pickupLat,
      pickupLng,
      pickupAccuracy,
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

    const savedRide = await prisma.rideBooking.create({
      data: {
        pickup,
        dropoff,
        pickupLat,
        pickupLng,
        pickupAccuracy: pickupAccuracy ?? null,
        dropoffLat,
        dropoffLng,
        distanceKm: Math.round(pricing.distanceKm * 10) / 10,
        locationCapturedAt: new Date(),
        estimatedPrice: pricing.total,
        distance: `${startDate} den ${endDate}`,
        time: `${pricing.totalDays} ngay`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, id: savedRide.id });
  } catch {
    return NextResponse.json({ error: "Loi server." }, { status: 500 });
  }
}

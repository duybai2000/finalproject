import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculateDriverHirePrice } from "@/lib/pricing";

const RideSchema = z.object({
  pickup: z.string().trim().min(1, "Vui lòng nhập điểm đón.").max(200),
  dropoff: z.string().trim().max(200).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ."),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ."),
  pickupLat: z.number().min(-90).max(90).optional(),
  pickupLng: z.number().min(-180).max(180).optional(),
  pickupAccuracy: z.number().nonnegative().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để đặt xe." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = RideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
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
    } = parsed.data;

    const pricing = calculateDriverHirePrice(startDate, endDate);

    if (!pricing) {
      return NextResponse.json(
        { error: "Khoảng thời gian thuê không hợp lệ." },
        { status: 400 }
      );
    }

    const savedRide = await prisma.rideBooking.create({
      data: {
        pickup,
        dropoff: dropoff ?? null,
        pickupLat: pickupLat ?? null,
        pickupLng: pickupLng ?? null,
        pickupAccuracy: pickupAccuracy ?? null,
        locationCapturedAt: pickupLat !== undefined ? new Date() : null,
        estimatedPrice: pricing.total,
        distance: `${startDate} đến ${endDate}`,
        time: `${pricing.totalDays} ngày`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, id: savedRide.id });
  } catch {
    return NextResponse.json({ error: "Lỗi máy chủ." }, { status: 500 });
  }
}

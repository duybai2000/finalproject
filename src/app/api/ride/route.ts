import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculateDriverHirePrice, getDriverDailyRate } from "@/lib/pricing";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as { id?: string }).id) {
      return NextResponse.json(
        { error: "Vui long dang nhap de dat xe." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      pickup,
      dropoff,
      startDate,
      endDate,
      pickupLat,
      pickupLng,
      pickupAccuracy,
    } = body;

    if (!pickup || !dropoff || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Vui long nhap diem don, diem den va thoi gian thue." },
        { status: 400 }
      );
    }

    const hasPickupCoordinates =
      typeof pickupLat === "number" &&
      Number.isFinite(pickupLat) &&
      typeof pickupLng === "number" &&
      Number.isFinite(pickupLng);

    if (!hasPickupCoordinates) {
      return NextResponse.json(
        { error: "Vui long bat vi tri hien tai de dat xe." },
        { status: 400 }
      );
    }

    if (
      pickupLat < -90 ||
      pickupLat > 90 ||
      pickupLng < -180 ||
      pickupLng > 180
    ) {
      return NextResponse.json(
        { error: "Toa do hien tai khong hop le." },
        { status: 400 }
      );
    }

    const pricing = calculateDriverHirePrice(startDate, endDate);

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
        pickupAccuracy:
          typeof pickupAccuracy === "number" && Number.isFinite(pickupAccuracy)
            ? pickupAccuracy
            : null,
        locationCapturedAt: new Date(),
        estimatedPrice: pricing.total,
        distance: `${startDate} den ${endDate}`,
        time: `${pricing.totalDays} ngay`,
        userId: (session.user as { id: string }).id,
      },
    });

    return NextResponse.json({
      success: true,
      price: savedRide.estimatedPrice,
      totalDays: pricing.totalDays,
      surchargeDays: pricing.surchargeDays,
      surchargeTotal: pricing.surchargeTotal,
      dailyRate: getDriverDailyRate(),
      schedule: savedRide.distance,
      durationLabel: savedRide.time,
      pickupCoordinates: {
        lat: savedRide.pickupLat,
        lng: savedRide.pickupLng,
        accuracy: savedRide.pickupAccuracy,
      },
    });
  } catch {
    return NextResponse.json({ error: "Loi server." }, { status: 500 });
  }
}

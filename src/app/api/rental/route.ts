import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculateCarRentalPrice } from "@/lib/pricing";

const RentalSchema = z.object({
  carId: z.number().int().positive(),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay khong hop le."),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay khong hop le."),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thuê xe." },
        { status: 401 }
      );
    }

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (!userExists) {
      return NextResponse.json(
        { error: "Phiên đã hết hạn. Vui lòng đăng nhập lại." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = RentalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Du lieu khong hop le." },
        { status: 400 }
      );
    }

    const { carId, pickupDate, returnDate } = parsed.data;
    const car = await prisma.car.findUnique({ where: { id: carId } });

    if (!car || !car.active) {
      return NextResponse.json(
        { error: "Xe khong ton tai hoac khong con phuc vu." },
        { status: 400 }
      );
    }

    const pricing = calculateCarRentalPrice(car.dailyRate, pickupDate, returnDate);

    if (!pricing) {
      return NextResponse.json(
        { error: "Khoang thoi gian thue khong hop le." },
        { status: 400 }
      );
    }

    const savedRental = await prisma.rentalBooking.create({
      data: {
        carId: car.id,
        carName: car.name,
        dateRange: `${pickupDate} den ${returnDate}`,
        totalPrice: pricing.total,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, id: savedRental.id });
  } catch {
    return NextResponse.json({ error: "Loi server." }, { status: 500 });
  }
}

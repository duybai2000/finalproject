import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculateCarRentalPrice } from "@/lib/pricing";

const RentalSchema = z.object({
  carId: z.number().int().positive(),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to rent a car." },
        { status: 401 }
      );
    }

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (!userExists) {
      return NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = RentalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const { carId, pickupDate, returnDate } = parsed.data;
    const car = await prisma.car.findUnique({ where: { id: carId } });

    if (!car || !car.active) {
      return NextResponse.json(
        { error: "Car does not exist or is no longer listed." },
        { status: 400 }
      );
    }

    const pricing = calculateCarRentalPrice(car.dailyRate, pickupDate, returnDate);

    if (!pricing) {
      return NextResponse.json(
        { error: "Invalid rental period." },
        { status: 400 }
      );
    }

    const savedRental = await prisma.rentalBooking.create({
      data: {
        carId: car.id,
        carName: car.name,
        dateRange: `${pickupDate} to ${returnDate}`,
        totalPrice: pricing.total,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, id: savedRental.id });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

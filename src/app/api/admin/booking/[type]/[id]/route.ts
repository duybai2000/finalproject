import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { RENTAL_STATUSES, RIDE_STATUSES } from "@/lib/bookingStatus";

const RideUpdateSchema = z.object({ status: z.enum(RIDE_STATUSES) });
const RentalUpdateSchema = z.object({ status: z.enum(RENTAL_STATUSES) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden." },
      { status: 403 }
    );
  }

  const { type, id } = await params;

  if (type !== "ride" && type !== "rental") {
    return NextResponse.json({ error: "Invalid booking type." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed =
    type === "ride"
      ? RideUpdateSchema.safeParse(body)
      : RentalUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid status." },
      { status: 400 }
    );
  }

  try {
    if (type === "ride") {
      const updated = await prisma.rideBooking.update({
        where: { id },
        data: { status: parsed.data.status },
      });
      return NextResponse.json({ success: true, status: updated.status });
    }

    const updated = await prisma.rentalBooking.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ success: true, status: updated.status });
  } catch {
    return NextResponse.json(
      { error: "Booking not found." },
      { status: 404 }
    );
  }
}

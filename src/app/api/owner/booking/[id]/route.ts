import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { RENTAL_STATUSES } from "@/lib/bookingStatus";

const StatusSchema = z.object({ status: z.enum(RENTAL_STATUSES) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;

  const rental = await prisma.rentalBooking.findUnique({ where: { id } });
  if (!rental) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  // verify the car belongs to this owner
  const car = await prisma.car.findUnique({ where: { id: rental.carId } });
  if (!car || car.ownerId !== session.user.id) {
    return NextResponse.json({ error: "This booking is not on one of your cars." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  await prisma.rentalBooking.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ success: true, status: parsed.data.status });
}

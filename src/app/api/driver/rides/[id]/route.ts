import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { RIDE_STATUSES } from "@/lib/bookingStatus";

const StatusSchema = z.object({ status: z.enum(RIDE_STATUSES) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "DRIVER") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const ride = await prisma.rideBooking.findUnique({ where: { id } });
  if (!ride || ride.driverId !== session.user.id) {
    return NextResponse.json(
      { error: "This ride is not assigned to you." },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  // Drivers can only flow ACCEPTED -> COMPLETED or back to PENDING (release).
  // Block COMPLETED before driver was the one who accepted.
  await prisma.rideBooking.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ success: true });
}

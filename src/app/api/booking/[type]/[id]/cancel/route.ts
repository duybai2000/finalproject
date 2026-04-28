import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please sign in." },
      { status: 401 }
    );
  }

  const { type, id } = await params;

  if (type !== "ride" && type !== "rental") {
    return NextResponse.json({ error: "Invalid booking type." }, { status: 400 });
  }

  const userId = session.user.id;

  if (type === "ride") {
    const ride = await prisma.rideBooking.findUnique({ where: { id } });
    if (!ride || ride.userId !== userId) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (ride.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending bookings can be cancelled." },
        { status: 400 }
      );
    }
    await prisma.rideBooking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ success: true });
  }

  const rental = await prisma.rentalBooking.findUnique({ where: { id } });
  if (!rental || rental.userId !== userId) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (rental.status !== "PENDING") {
    return NextResponse.json(
      { error: "Only pending bookings can be cancelled." },
      { status: 400 }
    );
  }
  await prisma.rentalBooking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  return NextResponse.json({ success: true });
}

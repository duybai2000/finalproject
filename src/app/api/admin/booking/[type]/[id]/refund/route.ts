import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { type, id } = await params;
  if (type !== "ride" && type !== "rental") {
    return NextResponse.json({ error: "Invalid booking type." }, { status: 400 });
  }

  if (type === "ride") {
    const ride = await prisma.rideBooking.findUnique({ where: { id } });
    if (!ride) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (!ride.paidAt) {
      return NextResponse.json(
        { error: "This booking has not been paid; nothing to refund." },
        { status: 400 }
      );
    }
    if (ride.refundedAt) {
      return NextResponse.json(
        { error: "This booking has already been refunded." },
        { status: 400 }
      );
    }
    await prisma.rideBooking.update({
      where: { id },
      data: { refundedAt: new Date(), status: "CANCELLED" },
    });
    return NextResponse.json({ success: true });
  }

  const rental = await prisma.rentalBooking.findUnique({ where: { id } });
  if (!rental) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (!rental.paidAt) {
    return NextResponse.json(
      { error: "This booking has not been paid; nothing to refund." },
      { status: 400 }
    );
  }
  if (rental.refundedAt) {
    return NextResponse.json(
      { error: "This booking has already been refunded." },
      { status: 400 }
    );
  }
  await prisma.rentalBooking.update({
    where: { id },
    data: { refundedAt: new Date(), status: "CANCELLED" },
  });
  return NextResponse.json({ success: true });
}

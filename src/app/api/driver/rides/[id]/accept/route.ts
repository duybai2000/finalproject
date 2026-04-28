import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "DRIVER") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const ride = await prisma.rideBooking.findUnique({ where: { id } });
  if (!ride) {
    return NextResponse.json({ error: "Ride not found." }, { status: 404 });
  }

  if (ride.driverId) {
    return NextResponse.json(
      { error: "Another driver already accepted this ride." },
      { status: 400 }
    );
  }

  if (ride.status !== "PENDING") {
    return NextResponse.json(
      { error: "You can only accept pending rides." },
      { status: 400 }
    );
  }

  await prisma.rideBooking.update({
    where: { id },
    data: { driverId: session.user.id, status: "ACCEPTED" },
  });

  return NextResponse.json({ success: true });
}

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
      { error: "Vui long dang nhap." },
      { status: 401 }
    );
  }

  const { type, id } = await params;

  if (type !== "ride" && type !== "rental") {
    return NextResponse.json({ error: "Loai don khong hop le." }, { status: 400 });
  }

  const userId = session.user.id;

  if (type === "ride") {
    const ride = await prisma.rideBooking.findUnique({ where: { id } });
    if (!ride || ride.userId !== userId) {
      return NextResponse.json({ error: "Khong tim thay don." }, { status: 404 });
    }
    if (ride.status !== "PENDING") {
      return NextResponse.json(
        { error: "Chi co the huy don dang cho." },
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
    return NextResponse.json({ error: "Khong tim thay don." }, { status: 404 });
  }
  if (rental.status !== "PENDING") {
    return NextResponse.json(
      { error: "Chi co the huy don dang cho." },
      { status: 400 }
    );
  }
  await prisma.rentalBooking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  return NextResponse.json({ success: true });
}

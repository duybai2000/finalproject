import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const RatingSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export async function POST(
  request: Request,
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

  const body = await request.json().catch(() => null);
  const parsed = RatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input." },
      { status: 400 }
    );
  }

  if (type === "ride") {
    const ride = await prisma.rideBooking.findUnique({
      where: { id },
      include: { rating: true },
    });
    if (!ride || ride.userId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (ride.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "You can only rate a completed ride." },
        { status: 400 }
      );
    }
    if (ride.rating) {
      return NextResponse.json(
        { error: "You have already rated this ride." },
        { status: 400 }
      );
    }
    await prisma.rating.create({
      data: {
        score: parsed.data.score,
        comment: parsed.data.comment,
        rideId: id,
        raterId: session.user.id,
      },
    });
    return NextResponse.json({ success: true });
  }

  const rental = await prisma.rentalBooking.findUnique({
    where: { id },
    include: { rating: true },
  });
  if (!rental || rental.userId !== session.user.id) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (rental.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "You can only rate a completed booking." },
      { status: 400 }
    );
  }
  if (rental.rating) {
    return NextResponse.json(
      { error: "You have already rated this booking." },
      { status: 400 }
    );
  }
  await prisma.rating.create({
    data: {
      score: parsed.data.score,
      comment: parsed.data.comment,
      rentalId: id,
      raterId: session.user.id,
    },
  });
  return NextResponse.json({ success: true });
}

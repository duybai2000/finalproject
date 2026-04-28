import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const RoleSchema = z.object({ role: z.enum(["USER", "ADMIN"]) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = RoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  if (id === session.user.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json(
      { error: "You cannot demote your own admin account." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.update({ where: { id }, data: { role: parsed.data.role } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  const [rideCount, rentalCount] = await Promise.all([
    prisma.rideBooking.count({ where: { userId: id } }),
    prisma.rentalBooking.count({ where: { userId: id } }),
  ]);

  if (rideCount + rentalCount > 0) {
    return NextResponse.json(
      {
        error: `User has ${rideCount + rentalCount} active booking(s) and cannot be deleted.`,
      },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
}

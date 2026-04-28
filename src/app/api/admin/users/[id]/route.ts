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
    return NextResponse.json({ error: "Khong co quyen." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = RoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vai tro khong hop le." }, { status: 400 });
  }

  if (id === session.user.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Khong the tu ha quyen admin cua chinh minh." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.update({ where: { id }, data: { role: parsed.data.role } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Khong tim thay nguoi dung." }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Khong co quyen." }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Khong the xoa tai khoan cua chinh minh." },
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
        error: `Nguoi dung con ${rideCount + rentalCount} don. Khong the xoa.`,
      },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Khong tim thay nguoi dung." }, { status: 404 });
  }
}

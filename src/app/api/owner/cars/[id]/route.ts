import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const CarUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  type: z.string().trim().min(1).max(50).optional(),
  seats: z.number().int().min(1).max(64).optional(),
  auto: z.boolean().optional(),
  dailyRate: z.number().int().positive().optional(),
  img: z.string().url().optional(),
  description: z.string().trim().max(1000).optional(),
  active: z.boolean().optional(),
});

function parseId(raw: string) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function ensureOwnedCar(carId: number, userId: string) {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car || car.ownerId !== userId) return null;
  return car;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "OWNER") {
    return NextResponse.json({ error: "Khong co quyen." }, { status: 403 });
  }

  const { id } = await params;
  const carId = parseId(id);
  if (!carId) {
    return NextResponse.json({ error: "ID khong hop le." }, { status: 400 });
  }

  const owned = await ensureOwnedCar(carId, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Khong tim thay xe cua ban." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = CarUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Du lieu khong hop le." },
      { status: 400 }
    );
  }

  await prisma.car.update({ where: { id: carId }, data: parsed.data });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "OWNER") {
    return NextResponse.json({ error: "Khong co quyen." }, { status: 403 });
  }

  const { id } = await params;
  const carId = parseId(id);
  if (!carId) {
    return NextResponse.json({ error: "ID khong hop le." }, { status: 400 });
  }

  const owned = await ensureOwnedCar(carId, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Khong tim thay xe cua ban." }, { status: 404 });
  }

  await prisma.car.delete({ where: { id: carId } });
  return NextResponse.json({ success: true });
}

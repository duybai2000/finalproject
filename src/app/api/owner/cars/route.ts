import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const CarCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(50),
  seats: z.number().int().min(1).max(64),
  auto: z.boolean(),
  dailyRate: z.number().int().positive(),
  img: z.string().url(),
  active: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "OWNER") {
    return NextResponse.json({ error: "Khong co quyen." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = CarCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Du lieu khong hop le." },
      { status: 400 }
    );
  }

  const car = await prisma.car.create({
    data: { ...parsed.data, ownerId: session.user.id },
  });
  return NextResponse.json({ success: true, id: car.id });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const ProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\s().-]{8,20}$/, "Invalid phone number.")
      .optional()
      .or(z.literal("")),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(6, "New password must be at least 6 characters.").max(128).optional(),
  })
  .refine(
    (data) =>
      (data.newPassword === undefined && data.currentPassword === undefined) ||
      (data.newPassword !== undefined && data.currentPassword !== undefined),
    { message: "Both current password and new password are required." }
  );

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please sign in." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input." },
      { status: 400 }
    );
  }

  const { name, phone, currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Account not found." },
      { status: 404 }
    );
  }

  const data: { name?: string; phone?: string | null; password?: string } = {};
  if (name !== undefined) data.name = name;
  if (phone !== undefined) data.phone = phone === "" ? null : phone;

  if (newPassword && currentPassword) {
    if (!user.password) {
      return NextResponse.json(
        { error: "Account has no password set." },
        { status: 400 }
      );
    }
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }
    data.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Nothing to change." },
      { status: 400 }
    );
  }

  await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ success: true });
}

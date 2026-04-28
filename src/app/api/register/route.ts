import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "@/lib/prisma";

const RegisterSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().toLowerCase().email("Email khong hop le.").max(254),
  password: z
    .string()
    .min(6, "Mat khau toi thieu 6 ky tu.")
    .max(128, "Mat khau qua dai."),
  role: z.enum(["USER", "OWNER"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Du lieu khong hop le." },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email da duoc su dung." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role ?? "USER" },
    });

    return NextResponse.json({
      message: "Tao tai khoan thanh cong",
      user: { id: user.id, email: user.email },
    });
  } catch {
    return NextResponse.json({ error: "Loi server." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ và tên.").max(100),
  email: z.string().trim().toLowerCase().email("Email không hợp lệ.").max(254),
  message: z.string().trim().min(5, "Tin nhắn quá ngắn.").max(2000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
        { status: 400 }
      );
    }

    await prisma.contactMessage.create({ data: parsed.data });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi máy chủ." }, { status: 500 });
  }
}

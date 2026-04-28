import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your full name.").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email.").max(254),
  message: z.string().trim().min(5, "Message is too short.").max(2000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    await prisma.contactMessage.create({ data: parsed.data });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

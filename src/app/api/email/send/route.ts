import { NextResponse } from "next/server";
import { z } from "zod";
import { sendBookingEmail } from "@/services/email.service";

const schema = z.object({
  to: z.string().email(),
  subject: z.string().min(2),
  heading: z.string().min(2),
  body: z.string().min(2),
  companyName: z.string().min(2),
  companyId: z.string().uuid(),
  bookingId: z.string().uuid().optional()
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid email payload" }, { status: 400 });

  const result = await sendBookingEmail(parsed.data);
  return NextResponse.json({ result });
}

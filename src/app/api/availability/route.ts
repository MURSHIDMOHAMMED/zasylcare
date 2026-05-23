import { NextResponse } from "next/server";
import { z } from "zod";
import { createAvailabilitySlot, deleteAvailabilitySlot, listAvailabilitySlots } from "@/services/availability.service";

const demoCompanyId = "00000000-0000-4000-8000-000000000001";

const availabilitySchema = z.object({
  companyId: z.string().uuid().default(demoCompanyId),
  slotDate: z.string().min(10),
  slotTime: z.string().min(4)
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") ?? demoCompanyId;
  const slots = await listAvailabilitySlots(companyId);
  return NextResponse.json({ slots });
}

export async function POST(request: Request) {
  const parsed = availabilitySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid availability slot", issues: parsed.error.flatten() }, { status: 400 });
  }

  const slot = await createAvailabilitySlot(parsed.data);
  return NextResponse.json({ slot }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") ?? demoCompanyId;
  const slotId = searchParams.get("slotId");

  if (!slotId) {
    return NextResponse.json({ error: "slotId is required" }, { status: 400 });
  }

  await deleteAvailabilitySlot(companyId, slotId);
  return NextResponse.json({ success: true });
}

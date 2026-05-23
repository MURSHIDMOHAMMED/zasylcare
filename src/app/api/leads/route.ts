import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validations";
import { isAvailabilitySlotOpen } from "@/services/availability.service";
import { createLead, listLeads } from "@/services/lead.service";

export async function GET() {
  const leads = await listLeads();
  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const parsed = leadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const slotOpen = await isAvailabilitySlotOpen(parsed.data.companyId, parsed.data.bookingDate, parsed.data.bookingTime);
  if (!slotOpen) {
    return NextResponse.json({ error: "This consultation slot is no longer available. Please choose another available time." }, { status: 409 });
  }

  const lead = await createLead(parsed.data);
  return NextResponse.json({ lead }, { status: 201 });
}

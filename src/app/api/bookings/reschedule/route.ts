import { NextResponse } from "next/server";
import { bookingActionSchema } from "@/lib/validations";
import { createWhatsAppUrl } from "@/lib/whatsapp";
import { updateBookingStatus } from "@/services/booking.service";
import { getCompanyBySlugOrId } from "@/services/company.service";
import { getLeadById } from "@/services/lead.service";

export async function POST(request: Request) {
  const parsed = bookingActionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid reschedule payload" }, { status: 400 });
  if (!parsed.data.suggestedDate || !parsed.data.suggestedTime) {
    return NextResponse.json({ error: "Suggested date and time are required" }, { status: 400 });
  }

  const booking = await updateBookingStatus({
    bookingId: parsed.data.bookingId,
    companyId: parsed.data.companyId,
    status: "Reschedule Requested",
    approvedDate: parsed.data.suggestedDate,
    approvedTime: parsed.data.suggestedTime,
    reason: parsed.data.reason
  });

  const [company, lead] = await Promise.all([
    getCompanyBySlugOrId(parsed.data.companyId),
    getLeadById(parsed.data.companyId, booking.leadId)
  ]);

  let whatsappUrl = null;

  if (company && lead) {
    const whatsappMessage = `Hi ${lead.customerName},\n\nWe are sorry, but we need to reschedule your consultation call with ${company.name}.\n\nSuggested new timing:\nDate: ${parsed.data.suggestedDate}\nTime: ${parsed.data.suggestedTime}\nCall number: ${lead.phone}\n\nYour health and comfort matter to us. We want to make sure you receive proper attention from our care team, without rushing your consultation.\n\nPlease reply with one of the following:\n- Yes, this time works for me\n- No, I need another time\n- Please call me to discuss\n\nIf this suggested time does not work for you, share a preferred date and time. We will do our best to arrange a suitable slot.\n\nWarm regards,\n${company.name} Care Team`;

    whatsappUrl = createWhatsAppUrl(lead.phone, whatsappMessage);
  }

  return NextResponse.json({ booking, whatsappUrl });
}

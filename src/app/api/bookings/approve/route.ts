import { NextResponse } from "next/server";
import { bookingActionSchema } from "@/lib/validations";
import { updateBookingStatus } from "@/services/booking.service";
import { getCompanyBySlugOrId } from "@/services/company.service";
import { sendBookingEmail } from "@/services/email.service";
import { getLeadById } from "@/services/lead.service";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export async function POST(request: Request) {
  const parsed = bookingActionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid approval payload" }, { status: 400 });

  const booking = await updateBookingStatus({
    bookingId: parsed.data.bookingId,
    companyId: parsed.data.companyId,
    status: "Approved",
    approvedDate: parsed.data.approvedDate,
    approvedTime: parsed.data.approvedTime,
    reason: parsed.data.reason
  });

  const [company, lead] = await Promise.all([
    getCompanyBySlugOrId(parsed.data.companyId),
    getLeadById(parsed.data.companyId, booking.leadId)
  ]);

  let emailResult = null;
  let whatsappUrl = null;

  if (company && lead) {
    const date = booking.approvedDate ?? booking.requestedDate;
    const time = booking.approvedTime ?? booking.requestedTime;
    const whatsappMessage = `Hi ${lead.customerName},\n\nThank you for trusting ${company.name}. Your consultation call has been confirmed.\n\nBooking details:\nDate: ${date}\nTime: ${time}\nCall number: ${lead.phone}\n\nOur care team understands how important the right guidance can be when you are managing your health. We will call you at the scheduled time and listen carefully to your concern.\n\nBefore the call, please keep these ready if available:\n- Recent medical reports\n- Current prescriptions or medicines\n- Any symptoms or health concerns you want to discuss\n- Questions you would like to ask the care team\n\nIf this time is still convenient, no action is needed. If you need any change, please reply to this message.\n\nWarm regards,\n${company.name} Care Team`;

    whatsappUrl = createWhatsAppUrl(lead.phone, whatsappMessage);
  }

  if (company && lead?.email) {
    emailResult = await sendBookingEmail({
      to: lead.email,
      subject: "Your free consultation call is booked",
      heading: "You are booked for your free call",
      body: `Hi ${lead.customerName}, your free consultation call has been approved for ${booking.approvedDate ?? booking.requestedDate} at ${booking.approvedTime ?? booking.requestedTime}. Our admin team will call you at ${lead.phone}.`,
      companyName: company.name,
      companyId: company.id,
      bookingId: booking.id
    }).catch((error) => ({ status: "failed", error: error instanceof Error ? error.message : "Email failed" }));
  }

  return NextResponse.json({ booking, emailResult, whatsappUrl });
}

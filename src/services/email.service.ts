import { getResendClient } from "@/lib/resend";

export async function sendBookingEmail(input: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  companyName: string;
  companyId: string;
  bookingId?: string;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? "ReceptionAI <support@example.com>";

  if (!resend) {
    return { id: "email-demo", status: "pending" };
  }

  return resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1>${input.heading}</h1>
        <p>${input.body}</p>
        <p>Thank you,<br/>${input.companyName}</p>
      </div>
    `
  });
}

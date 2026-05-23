import { createSupabaseServiceClient } from "@/lib/supabase";
import type { Booking } from "@/types/booking.types";

export const demoBookings: Booking[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    companyId: "00000000-0000-4000-8000-000000000001",
    leadId: "lead-1",
    requestedDate: "2026-05-25",
    requestedTime: "11:00",
    status: "Pending Approval",
    notes: "Wants a morning call.",
    createdAt: "2026-05-22T09:25:00.000Z",
    updatedAt: "2026-05-22T09:25:00.000Z"
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    companyId: "00000000-0000-4000-8000-000000000001",
    leadId: "lead-2",
    requestedDate: "2026-05-26",
    requestedTime: "15:30",
    approvedDate: "2026-05-26",
    approvedTime: "15:30",
    status: "Approved",
    notes: "Enterprise discovery.",
    createdAt: "2026-05-21T15:12:00.000Z",
    updatedAt: "2026-05-22T08:30:00.000Z"
  }
];

const demoCompanyId = "00000000-0000-4000-8000-000000000001";

export async function listBookings(companyId?: string): Promise<Booking[]> {
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;
  if (error || !data) {
    if (!companyId || companyId === demoCompanyId) return demoBookings;

    return [];
  }

  return data.map((booking) => ({
    id: booking.id,
    companyId: booking.company_id,
    leadId: booking.lead_id,
    requestedDate: booking.requested_date,
    requestedTime: booking.requested_time,
    approvedDate: booking.approved_date,
    approvedTime: booking.approved_time,
    status: booking.status,
    notes: booking.notes,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at
  }));
}

export async function updateBookingStatus(input: {
  bookingId: string;
  companyId: string;
  status: Booking["status"];
  approvedDate?: string;
  approvedTime?: string;
  reason?: string;
}) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: input.status,
      approved_date: input.approvedDate,
      approved_time: input.approvedTime,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.bookingId)
    .eq("company_id", input.companyId)
    .select()
    .single();

  if (error) {
    if (input.companyId !== demoCompanyId) throw error;

    const updatedAt = new Date().toISOString();
    const booking = demoBookings.find((item) => item.id === input.bookingId);

    if (booking) {
      booking.status = input.status;
      booking.approvedDate = input.approvedDate;
      booking.approvedTime = input.approvedTime;
      booking.updatedAt = updatedAt;
    }

    return booking ?? {
      id: input.bookingId,
      companyId: input.companyId,
      leadId: "",
      requestedDate: input.approvedDate ?? "",
      requestedTime: input.approvedTime ?? "",
      status: input.status,
      approvedDate: input.approvedDate,
      approvedTime: input.approvedTime,
      updatedAt,
      createdAt: updatedAt
    };
  }

  await supabase.from("booking_status_logs").insert({
    booking_id: input.bookingId,
    company_id: input.companyId,
    status: input.status,
    note: input.reason
  });

  return {
    id: data.id,
    companyId: data.company_id,
    leadId: data.lead_id,
    requestedDate: data.requested_date,
    requestedTime: data.requested_time,
    approvedDate: data.approved_date,
    approvedTime: data.approved_time,
    status: data.status,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

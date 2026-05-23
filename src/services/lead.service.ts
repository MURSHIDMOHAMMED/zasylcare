import { createSupabaseServiceClient } from "@/lib/supabase";
import { demoBookings } from "@/services/booking.service";
import type { Lead, LeadMessage } from "@/types/lead.types";

export const demoLeads: Lead[] = [
  {
    id: "lead-1",
    companyId: "00000000-0000-4000-8000-000000000001",
    customerName: "Sarah Malik",
    email: "sarah@example.com",
    phone: "+1 555 0188",
    serviceInterest: "Growth package",
    bookingDate: "2026-05-25",
    bookingTime: "11:00",
    leadSource: "Chatbot",
    leadScore: 86,
    status: "Pending",
    notes: "Asked about CRM and booking approvals.",
    createdAt: "2026-05-22T09:20:00.000Z",
    updatedAt: "2026-05-22T09:20:00.000Z"
  },
  {
    id: "lead-2",
    companyId: "00000000-0000-4000-8000-000000000001",
    customerName: "Omar Khan",
    email: "omar@example.com",
    phone: "+1 555 0142",
    serviceInterest: "Enterprise integration",
    bookingDate: "2026-05-26",
    bookingTime: "15:30",
    leadSource: "Chatbot",
    leadScore: 73,
    status: "Approved",
    notes: "Needs WhatsApp integration later.",
    createdAt: "2026-05-21T15:10:00.000Z",
    updatedAt: "2026-05-22T08:30:00.000Z"
  }
];

const demoCompanyId = "00000000-0000-4000-8000-000000000001";

export async function listLeads(companyId?: string): Promise<Lead[]> {
  const supabase = createSupabaseServiceClient();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;

  if (error || !data) {
    if (!companyId || companyId === demoCompanyId) {
      return demoLeads;
    }

    return [];
  }

  return data.map((lead) => ({
    id: lead.id,
    companyId: lead.company_id,
    customerName: lead.customer_name,
    email: lead.email,
    phone: lead.phone,
    serviceInterest: lead.service_interest,
    bookingDate: lead.booking_date,
    bookingTime: lead.booking_time,
    leadSource: lead.lead_source,
    leadScore: lead.lead_score,
    status: lead.status,
    notes: lead.notes,
    customFields: lead.custom_fields,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at
  }));
}

export async function getLeadById(companyId: string, leadId: string): Promise<Lead | null> {
  const demoLead = demoLeads.find((lead) => lead.companyId === companyId && lead.id === leadId);

  if (demoLead) {
    return demoLead;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", leadId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    companyId: data.company_id,
    customerName: data.customer_name,
    email: data.email,
    phone: data.phone,
    serviceInterest: data.service_interest,
    bookingDate: data.booking_date,
    bookingTime: data.booking_time,
    leadSource: data.lead_source,
    leadScore: data.lead_score,
    status: data.status,
    notes: data.notes,
    customFields: data.custom_fields,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function createLead(payload: Omit<Lead, "id" | "createdAt" | "updatedAt" | "leadSource" | "leadScore" | "status">) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      company_id: payload.companyId,
      customer_name: payload.customerName,
      email: payload.email,
      phone: payload.phone,
      service_interest: payload.serviceInterest,
      booking_date: payload.bookingDate,
      booking_time: payload.bookingTime,
      notes: payload.notes,
      custom_fields: payload.customFields,
      lead_source: "Chatbot",
      lead_score: 65,
      status: "Pending"
    })
    .select()
    .single();

  if (error || !data) {
    if (payload.companyId !== demoCompanyId) throw error ?? new Error("Lead was not created");

    const now = new Date().toISOString();
    const lead: Lead = {
      id: crypto.randomUUID(),
      ...payload,
      leadSource: "Chatbot",
      leadScore: 65,
      status: "Pending",
      createdAt: now,
      updatedAt: now
    };

    demoLeads.unshift(lead);

    if (payload.bookingDate && payload.bookingTime) {
      demoBookings.unshift({
        id: crypto.randomUUID(),
        companyId: payload.companyId,
        leadId: lead.id,
        requestedDate: payload.bookingDate,
        requestedTime: payload.bookingTime,
        status: "Pending Approval",
        notes: payload.notes,
        createdAt: now,
        updatedAt: now
      });
    }

    return lead;
  }

  if (payload.bookingDate && payload.bookingTime) {
    await supabase.from("bookings").insert({
      company_id: payload.companyId,
      lead_id: data.id,
      requested_date: payload.bookingDate,
      requested_time: payload.bookingTime,
      notes: payload.notes,
      status: "Pending Approval"
    });
  }

  return {
    id: data.id,
    companyId: data.company_id,
    customerName: data.customer_name,
    email: data.email,
    phone: data.phone,
    serviceInterest: data.service_interest,
    bookingDate: data.booking_date,
    bookingTime: data.booking_time,
    leadSource: data.lead_source,
    leadScore: data.lead_score,
    status: data.status,
    notes: data.notes,
    customFields: data.custom_fields,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function saveLeadMessage(message: Omit<LeadMessage, "id" | "createdAt">) {
  if (message.companyId === demoCompanyId || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return;
  }

  const supabase = createSupabaseServiceClient();
  await supabase.from("lead_messages").insert({
    company_id: message.companyId,
    lead_id: message.leadId,
    session_id: message.sessionId,
    role: message.role,
    content: message.content
  });
}

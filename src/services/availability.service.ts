import { promises as fs } from "fs";
import path from "path";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { demoBookings } from "@/services/booking.service";
import type { AvailabilitySlot } from "@/types/availability.types";

const demoCompanyId = "00000000-0000-4000-8000-000000000001";
const availabilityStorePath = path.join(process.cwd(), ".availability-slots.json");

type AvailabilityRow = {
  id: string;
  company_id: string;
  slot_date: string;
  slot_time: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

function mapAvailabilityRow(row: AvailabilityRow): AvailabilitySlot {
  return {
    id: row.id,
    companyId: row.company_id,
    slotDate: row.slot_date,
    slotTime: row.slot_time.slice(0, 5),
    enabled: row.enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function slotKey(date: string, time: string) {
  return `${date}T${time.slice(0, 5)}`;
}

async function readStoredSlots(): Promise<AvailabilitySlot[]> {
  try {
    const raw = await fs.readFile(availabilityStorePath, "utf8");
    const parsed = JSON.parse(raw) as AvailabilitySlot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStoredSlots(slots: AvailabilitySlot[]) {
  await fs.writeFile(availabilityStorePath, JSON.stringify(slots, null, 2));
}

async function listStoredAvailableSlots(companyId: string): Promise<AvailabilitySlot[]> {
  const bookedKeys = new Set(
    demoBookings
      .filter((booking) => booking.companyId === companyId && booking.status !== "Rejected")
      .map((booking) => slotKey(booking.requestedDate, booking.requestedTime))
  );

  const slots = await readStoredSlots();
  return slots
    .filter((slot) => slot.companyId === companyId && slot.enabled && !bookedKeys.has(slotKey(slot.slotDate, slot.slotTime)))
    .sort((a, b) => slotKey(a.slotDate, a.slotTime).localeCompare(slotKey(b.slotDate, b.slotTime)));
}

export async function listAvailabilitySlots(companyId = demoCompanyId): Promise<AvailabilitySlot[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("company_id", companyId)
    .eq("enabled", true)
    .gte("slot_date", new Date().toISOString().slice(0, 10))
    .order("slot_date")
    .order("slot_time");

  if (error || !data) {
    if (companyId === demoCompanyId) return listStoredAvailableSlots(companyId);
    return [];
  }

  const bookedResponse = await supabase
    .from("bookings")
    .select("requested_date, requested_time, status")
    .eq("company_id", companyId)
    .neq("status", "Rejected");

  const bookedKeys = new Set(
    (bookedResponse.data ?? []).map((booking) => slotKey(booking.requested_date, booking.requested_time))
  );

  return data
    .map((item) => mapAvailabilityRow(item))
    .filter((slot) => !bookedKeys.has(slotKey(slot.slotDate, slot.slotTime)));
}

export async function createAvailabilitySlot(input: {
  companyId: string;
  slotDate: string;
  slotTime: string;
}): Promise<AvailabilitySlot> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("availability_slots")
    .insert({
      company_id: input.companyId,
      slot_date: input.slotDate,
      slot_time: input.slotTime,
      enabled: true
    })
    .select()
    .single();

  if (error || !data) {
    if (input.companyId !== demoCompanyId) throw error ?? new Error("Availability slot was not created");

    const now = new Date().toISOString();
    const slot: AvailabilitySlot = {
      id: crypto.randomUUID(),
      companyId: input.companyId,
      slotDate: input.slotDate,
      slotTime: input.slotTime.slice(0, 5),
      enabled: true,
      createdAt: now,
      updatedAt: now
    };
    const stored = await readStoredSlots();
    await writeStoredSlots([slot, ...stored]);
    return slot;
  }

  return mapAvailabilityRow(data);
}

export async function deleteAvailabilitySlot(companyId: string, slotId: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("company_id", companyId)
    .eq("id", slotId);

  if (error) {
    if (companyId !== demoCompanyId) throw error;
    const stored = await readStoredSlots();
    await writeStoredSlots(stored.filter((slot) => slot.id !== slotId));
  }
}

export async function isAvailabilitySlotOpen(companyId: string, bookingDate?: string, bookingTime?: string) {
  if (!bookingDate || !bookingTime) return true;
  const availableSlots = await listAvailabilitySlots(companyId);
  return availableSlots.some((slot) => slot.slotDate === bookingDate && slot.slotTime === bookingTime.slice(0, 5));
}

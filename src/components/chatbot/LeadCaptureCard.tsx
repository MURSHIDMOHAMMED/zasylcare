"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarPlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { AvailabilitySlot } from "@/types/availability.types";

type LeadCaptureValues = {
  customerName: string;
  email: string;
  phone: string;
  serviceInterest: string;
  bookingDate: string;
  bookingTime: string;
  notes?: string;
};

export function LeadCaptureCard({
  companyId,
  onSaved,
  onCancel
}: {
  companyId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState("");
  const { register, handleSubmit, formState, setValue } = useForm<LeadCaptureValues>();

  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true);
      const response = await fetch(`/api/availability?companyId=${companyId}`);
      const data = await response.json().catch(() => ({ slots: [] }));
      setSlots(data.slots ?? []);
      setLoadingSlots(false);
    }

    loadSlots();
  }, [companyId]);

  async function onSubmit(values: LeadCaptureValues) {
    setError(null);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        ...values,
        notes: values.notes || "Captured from chatbot booking flow"
      })
    });

    if (!response.ok) {
      setError("Could not save your request. Please check the details and try again.");
      return;
    }

    onSaved();
  }

  return (
    <form className="ml-auto max-w-[92%] rounded-lg border bg-card p-4 shadow-soft md:max-w-xl" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Request a consultation</h2>
        </div>
        <button className="rounded-md p-1 text-muted-foreground hover:bg-muted" type="button" onClick={onCancel} aria-label="Close booking form">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input placeholder="Full name" {...register("customerName", { required: true })} />
        <Input placeholder="Email" type="email" {...register("email", { required: true })} />
        <Input placeholder="Phone" {...register("phone", { required: true, minLength: 7 })} />
        <Input placeholder="Service interested in" {...register("serviceInterest", { required: true })} />
        <select
          className="h-10 rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 md:col-span-2"
          disabled={loadingSlots || slots.length === 0}
          value={selectedSlot}
          onChange={(event) => {
            const value = event.target.value;
            const [date, time] = value.split("|");
            setSelectedSlot(value);
            setValue("bookingDate", date, { shouldValidate: true });
            setValue("bookingTime", time, { shouldValidate: true });
          }}
        >
          <option value="">{loadingSlots ? "Loading available slots..." : "Choose an available consultation slot"}</option>
          {slots.map((slot) => (
            <option key={slot.id} value={`${slot.slotDate}|${slot.slotTime}`}>
              {slot.slotDate} at {slot.slotTime}
            </option>
          ))}
        </select>
        <input type="hidden" {...register("bookingDate", { required: true })} />
        <input type="hidden" {...register("bookingTime", { required: true })} />
      </div>
      {!loadingSlots && slots.length === 0 && (
        <p className="mt-3 text-sm text-destructive">No consultation slots are available right now. Please contact the care team.</p>
      )}
      <Textarea className="mt-3" placeholder="Anything the team should know?" {...register("notes")} />
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Later
        </Button>
        <Button disabled={formState.isSubmitting || slots.length === 0}>
          <CalendarPlus className="h-4 w-4" /> Submit request
        </Button>
      </div>
    </form>
  );
}

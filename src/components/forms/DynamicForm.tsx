"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type LeadFormValues = {
  customerName: string;
  email: string;
  phone: string;
  serviceInterest: string;
  bookingDate?: string;
  bookingTime?: string;
  notes?: string;
};

export function DynamicForm() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const { register, handleSubmit, formState, reset } = useForm<LeadFormValues>();

  async function onSubmit(values: LeadFormValues) {
    setStatus(null);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: "00000000-0000-4000-8000-000000000001",
        ...values
      })
    });

    if (!response.ok) {
      setStatus("Could not save lead. Check the required fields and try again.");
      return;
    }

    reset();
    setStatus("Lead saved.");
    router.refresh();
  }

  return (
    <form className="grid gap-4 rounded-lg border bg-card p-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Full name" {...register("customerName", { required: true })} />
        <Input placeholder="Email" type="email" {...register("email", { required: true })} />
        <Input placeholder="Phone" {...register("phone", { required: true })} />
        <Input placeholder="Service interested in" {...register("serviceInterest", { required: true })} />
        <Input type="date" {...register("bookingDate")} />
        <Input type="time" {...register("bookingTime")} />
      </div>
      <Textarea placeholder="Notes or custom response" {...register("notes")} />
      <Button disabled={formState.isSubmitting}>Save lead request</Button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </form>
  );
}

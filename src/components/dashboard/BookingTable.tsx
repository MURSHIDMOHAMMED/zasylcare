"use client";

import { useState } from "react";
import { CalendarCheck, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { Booking } from "@/types/booking.types";

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  const [rows, setRows] = useState(bookings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [suggestedDate, setSuggestedDate] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("");

  function openReschedule(booking: Booking) {
    setRescheduleBooking(booking);
    setSuggestedDate(booking.approvedDate ?? booking.requestedDate);
    setSuggestedTime(booking.approvedTime ?? booking.requestedTime);
  }

  async function updateBooking(booking: Booking, action: "approve" | "reject" | "reschedule", reschedule?: { date: string; time: string }) {
    setBusyId(booking.id);

    const body: Record<string, string> = {
      bookingId: booking.id,
      companyId: booking.companyId
    };

    if (action === "approve") {
      body.approvedDate = booking.requestedDate;
      body.approvedTime = booking.requestedTime;
    }

    if (action === "reschedule") {
      body.suggestedDate = reschedule?.date ?? "";
      body.suggestedTime = reschedule?.time ?? "";
      if (!body.suggestedDate || !body.suggestedTime) {
        window.alert("Please choose both suggested date and suggested time.");
        setBusyId(null);
        return;
      }
    }

    const response = await fetch(`/api/bookings/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const data = (await response.json()) as {
        booking: Partial<Booking>;
        whatsappUrl?: string | null;
      };
      setRows((current) =>
        current.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                status: data.booking.status ?? item.status,
                approvedDate: data.booking.approvedDate ?? item.approvedDate,
                approvedTime: data.booking.approvedTime ?? item.approvedTime,
                updatedAt: data.booking.updatedAt ?? item.updatedAt
              }
            : item
        )
      );

      if (data.whatsappUrl) {
        window.location.href = data.whatsappUrl;
      }
      setRescheduleBooking(null);
    } else {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      window.alert(data?.error ?? `Failed to ${action} booking. Please try again.`);
    }

    setBusyId(null);
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b p-4">
        <h2 className="font-semibold">Booking Management</h2>
        <p className="text-sm text-muted-foreground">Review requests and approve, reject, or reschedule.</p>
      </div>
      <div className="divide-y">
        {rows.map((booking) => (
          <div key={booking.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">Lead #{booking.leadId}</p>
                <Badge>{booking.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Requested {booking.requestedDate} at {booking.requestedTime}. {booking.notes}
              </p>
              {booking.status === "Reschedule Requested" && booking.approvedDate && booking.approvedTime && (
                <p className="mt-1 text-sm font-medium text-primary">
                  Suggested new time: {booking.approvedDate} at {booking.approvedTime}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="h-9" variant="secondary" disabled={busyId === booking.id} onClick={() => updateBooking(booking, "approve")}>
                <CalendarCheck className="h-4 w-4" />Approve
              </Button>
              <Button className="h-9" variant="secondary" disabled={busyId === booking.id} onClick={() => openReschedule(booking)}>
                <Clock className="h-4 w-4" />Reschedule
              </Button>
              <Button className="h-9" variant="danger" disabled={busyId === booking.id} onClick={() => updateBooking(booking, "reject")}>
                <XCircle className="h-4 w-4" />Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!rescheduleBooking} onClose={() => setRescheduleBooking(null)} title="Reschedule Booking">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Choose the new suggested date and time. WhatsApp will open with the reschedule message ready to send.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Suggested date</label>
            <Input type="date" value={suggestedDate} onChange={(event) => setSuggestedDate(event.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Suggested time</label>
            <Input type="time" value={suggestedTime} onChange={(event) => setSuggestedTime(event.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRescheduleBooking(null)}>Cancel</Button>
            <Button
              disabled={!rescheduleBooking || busyId === rescheduleBooking.id}
              onClick={() => {
                if (!rescheduleBooking) return;
                updateBooking(rescheduleBooking, "reschedule", { date: suggestedDate, time: suggestedTime });
              }}
            >
              <Clock className="h-4 w-4" />Reschedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type { AvailabilitySlot } from "@/types/availability.types";

type SettingsData = {
  companyName: string;
  supportEmail: string;
  phone: string;
  timezone: string;
  greeting: string;
  tone: string;
  handoffEmail: string;
  collectBooking: boolean;
};

const toneOptions = ["professional", "friendly", "casual", "formal"];
const timezoneOptions = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Asia/Dubai", "Asia/Kolkata", "Asia/Tokyo", "UTC"];

export function SettingsForm() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    companyName: "Zasilcare Health",
    supportEmail: "support@zasilcare.example",
    phone: "+1 555 010 2040",
    timezone: "America/New_York",
    greeting: "Hi! How can I help you today?",
    tone: "professional",
    handoffEmail: "support@zasilcare.example",
    collectBooking: true
  });

  function update<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    // Simulate API save — in production this would call /api/admin/settings
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast("Settings saved successfully.");
  }

  return (
    <div className="space-y-6">
      {/* Company Settings */}
      <div className="rounded-lg border bg-card p-5">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Company Settings</h1>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />{saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Company Name</label>
            <Input value={settings.companyName} onChange={(e) => update("companyName", e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Support Email</label>
            <Input type="email" value={settings.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Company Phone</label>
            <Input value={settings.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Timezone</label>
            <select
              className="h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
              value={settings.timezone}
              onChange={(e) => update("timezone", e.target.value)}
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chatbot Settings */}
      <div className="rounded-lg border bg-card p-5">
        <h2 className="mb-5 text-lg font-semibold">Chatbot Configuration</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Greeting Message</label>
            <Input value={settings.greeting} onChange={(e) => update("greeting", e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Conversation Tone</label>
            <select
              className="h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
              value={settings.tone}
              onChange={(e) => update("tone", e.target.value)}
            >
              {toneOptions.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Handoff Email</label>
            <Input type="email" value={settings.handoffEmail} onChange={(e) => update("handoffEmail", e.target.value)} placeholder="Where to send lead notifications" />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <button
              className={`relative h-6 w-11 rounded-full transition ${settings.collectBooking ? "bg-primary" : "bg-muted"}`}
              onClick={() => update("collectBooking", !settings.collectBooking)}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.collectBooking ? "left-[22px]" : "left-0.5"}`} />
            </button>
            <span className="text-sm">Collect booking after interest detected</span>
          </div>
        </div>
      </div>

      {/* Lead Form Builder */}
      <AvailabilityManager />
      <InteractiveFormBuilder />
    </div>
  );
}

const demoCompanyId = "00000000-0000-4000-8000-000000000001";

function AvailabilityManager() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotDuration, setSlotDuration] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSlots() {
    setLoading(true);
    const response = await fetch(`/api/availability?companyId=${demoCompanyId}`);
    const data = await response.json().catch(() => ({ slots: [] }));
    setSlots(data.slots ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadSlots();
  }, []);

  function buildTimeSlots() {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return [];
    }

    const times: string[] = [];
    for (let minutes = start; minutes < end; minutes += slotDuration) {
      const hour = Math.floor(minutes / 60).toString().padStart(2, "0");
      const minute = (minutes % 60).toString().padStart(2, "0");
      times.push(`${hour}:${minute}`);
    }

    return times;
  }

  async function addSlots() {
    if (!slotDate || !startTime || !endTime) {
      toast("Choose date, from time, and to time.", "error");
      return;
    }

    const times = buildTimeSlots();
    if (times.length === 0) {
      toast("The end time must be after the start time.", "error");
      return;
    }

    const existingKeys = new Set(slots.map((slot) => `${slot.slotDate}|${slot.slotTime}`));
    const newTimes = times.filter((time) => !existingKeys.has(`${slotDate}|${time}`));
    if (newTimes.length === 0) {
      toast("These availability slots already exist.", "info");
      return;
    }

    setSaving(true);
    const responses = await Promise.all(
      newTimes.map((time) =>
        fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId: demoCompanyId,
            slotDate,
            slotTime: time
          })
        })
      )
    );

    const createdSlots = await Promise.all(
      responses
        .filter((response) => response.ok)
        .map(async (response) => {
          const data = await response.json();
          return data.slot as AvailabilitySlot;
        })
    );

    if (createdSlots.length > 0) {
      setSlots((current) =>
        [...current, ...createdSlots].sort((a, b) => `${a.slotDate}${a.slotTime}`.localeCompare(`${b.slotDate}${b.slotTime}`))
      );
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      toast(`${createdSlots.length} availability slots added.`);
    } else {
      toast("Could not add availability slots.", "error");
    }
    setSaving(false);
  }

  async function removeSlot(slotId: string) {
    const response = await fetch(`/api/availability?companyId=${demoCompanyId}&slotId=${slotId}`, { method: "DELETE" });
    if (response.ok) {
      setSlots((current) => current.filter((slot) => slot.id !== slotId));
      toast("Availability slot removed.");
    } else {
      toast("Could not remove slot.", "error");
    }
  }

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Consultation Availability</h2>
          <p className="text-sm text-muted-foreground">Patients can request calls only from these available slots.</p>
        </div>
        <Clock className="h-5 w-5 text-primary" />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Date</label>
          <Input type="date" value={slotDate} onChange={(event) => setSlotDate(event.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">From</label>
          <Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">To</label>
          <Input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Each slot</label>
          <select
            className="h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
            value={slotDuration}
            onChange={(event) => setSlotDuration(Number(event.target.value))}
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
          </select>
        </div>
        <Button onClick={addSlots} disabled={saving} className="self-end">
          <Plus className="h-4 w-4" />Add range
        </Button>
      </div>

      <div className="divide-y rounded-lg border">
        {loading && <p className="p-4 text-sm text-muted-foreground">Loading availability...</p>}
        {!loading && slots.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No available slots yet. Add a date and time above.</p>
        )}
        {slots.map((slot) => (
          <div key={slot.id} className="flex items-center justify-between gap-3 p-3">
            <div>
              <p className="text-sm font-medium">{slot.slotDate} at {slot.slotTime}</p>
              <p className="text-xs text-muted-foreground">Available for chatbot booking</p>
            </div>
            <Button variant="danger" className="h-9" onClick={() => removeSlot(slot.id)}>
              <Trash2 className="h-4 w-4" />Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Interactive Lead Form Builder (was static)
// ──────────────────────────────────────────────────────────────────────────────

type FormFieldItem = {
  id: string;
  label: string;
  type: string;
  required: boolean;
};

const fieldTypeOptions = ["Text", "Number", "Email", "Phone", "Select", "Checkbox", "Date", "Conditional"];

function InteractiveFormBuilder() {
  const { toast } = useToast();
  const [fields, setFields] = useState<FormFieldItem[]>([
    { id: "f-1", label: "Budget", type: "Number", required: false },
    { id: "f-2", label: "Location", type: "Text", required: true },
    { id: "f-3", label: "Consultation type", type: "Select", required: true },
    { id: "f-4", label: "Company size", type: "Conditional", required: false }
  ]);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("Text");
  const [newRequired, setNewRequired] = useState(false);

  function addField() {
    if (!newLabel.trim()) {
      toast("Field label is required.", "error");
      return;
    }
    setFields((prev) => [...prev, { id: `f-${Date.now()}`, label: newLabel, type: newType, required: newRequired }]);
    setNewLabel("");
    setNewType("Text");
    setNewRequired(false);
    setAdding(false);
    toast("Field added.");
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
    toast("Field removed.");
  }

  function toggleRequired(id: string) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  }

  function moveField(id: string, direction: "up" | "down") {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx < 0) return prev;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    });
  }

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Custom Lead Form Builder</h2>
          <p className="text-sm text-muted-foreground">Create required, optional, ordered, and conditional questions.</p>
        </div>
        <Button onClick={() => setAdding(true)} variant={adding ? "secondary" : "primary"}>
          {adding ? "Cancel" : <><span className="mr-1">+</span>Add field</>}
        </Button>
      </div>

      {adding && (
        <div className="mb-4 grid gap-3 rounded-lg border bg-muted/30 p-4 md:grid-cols-[1fr_auto_auto_auto]">
          <Input placeholder="Field label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          <select
            className="h-10 rounded-lg border bg-card px-3 text-sm"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          >
            {fieldTypeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={newRequired} onChange={(e) => setNewRequired(e.target.checked)} className="accent-primary" />
            Required
          </label>
          <Button onClick={addField} className="h-10">Add</Button>
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, idx) => (
          <div key={field.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={idx === 0}
                  onClick={() => moveField(field.id, "up")}
                  aria-label="Move up"
                >▲</button>
                <button
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={idx === fields.length - 1}
                  onClick={() => moveField(field.id, "down")}
                  aria-label="Move down"
                >▼</button>
              </div>
              <div>
                <p className="text-sm font-medium">{field.label}</p>
                <p className="text-xs text-muted-foreground">{field.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${field.required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                onClick={() => toggleRequired(field.id)}
              >
                {field.required ? "Required" : "Optional"}
              </button>
              <button
                className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => removeField(field.id)}
                aria-label="Remove field"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">No custom fields. Click &quot;Add field&quot; to create one.</p>
        )}
      </div>
    </div>
  );
}

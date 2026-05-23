"use client";

import { useState } from "react";
import { Edit, MessageSquareText, PackageCheck, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";

type Service = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  enabled: boolean;
};

const iconMap: Record<string, typeof MessageSquareText> = {
  "Healthcare Consultation Support": MessageSquareText,
  "Continuous Care Management": PackageCheck,
  "Patient Follow-up Coordination": ShieldCheck
};

const defaultServices: Service[] = [
  { id: "svc-1", name: "Healthcare Consultation Support", description: "Consultation support for patients who need help with health concerns and care planning.", priceLabel: "Contact team", enabled: true },
  { id: "svc-2", name: "Continuous Care Management", description: "Ongoing support for patients managing long-term or recurring health conditions.", priceLabel: "Contact team", enabled: true },
  { id: "svc-3", name: "Patient Follow-up Coordination", description: "Care team follow-up to help patients stay connected with the right healthcare guidance.", priceLabel: "Contact team", enabled: true }
];

export function ServiceManager() {
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Service | null>(null);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [enabled, setEnabled] = useState(true);

  function openAdd() {
    setEditItem(null);
    setName("");
    setDescription("");
    setPriceLabel("");
    setEnabled(true);
    setModalOpen(true);
  }

  function openEdit(svc: Service) {
    setEditItem(svc);
    setName(svc.name);
    setDescription(svc.description);
    setPriceLabel(svc.priceLabel);
    setEnabled(svc.enabled);
    setModalOpen(true);
  }

  function handleSave() {
    if (!name.trim() || !description.trim()) {
      toast("Name and description are required.", "error");
      return;
    }

    if (editItem) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editItem.id ? { ...s, name, description, priceLabel, enabled } : s
        )
      );
      toast("Service updated.");
    } else {
      const newSvc: Service = {
        id: `svc-${Date.now()}`,
        name,
        description,
        priceLabel,
        enabled
      };
      setServices((prev) => [...prev, newSvc]);
      toast("Service added.");
    }

    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast("Service deleted.");
  }

  function handleToggle(id: string) {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Service Packages</h1>
          <p className="text-sm text-muted-foreground">Manage the service offerings shown to visitors.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />Add service
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const Icon = iconMap[service.name] ?? PackageCheck;
          return (
            <div
              key={service.id}
              className={`group relative rounded-lg border bg-card p-5 transition ${!service.enabled ? "opacity-50" : ""}`}
            >
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
                  onClick={() => openEdit(service)}
                  aria-label="Edit"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleDelete(service.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <Icon className="mb-4 h-6 w-6 text-primary" />
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-semibold">{service.name}</h2>
                {!service.enabled && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Disabled</Badge>}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{service.description}</p>
              {service.priceLabel && (
                <p className="mt-3 text-lg font-semibold text-primary">{service.priceLabel}</p>
              )}
              <div className="mt-4 flex items-center gap-2">
                <button
                  className={`relative h-6 w-11 rounded-full transition ${service.enabled ? "bg-primary" : "bg-muted"}`}
                  onClick={() => handleToggle(service.id)}
                  aria-label="Toggle enabled"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${service.enabled ? "left-[22px]" : "left-0.5"}`}
                  />
                </button>
                <span className="text-xs text-muted-foreground">{service.enabled ? "Active" : "Inactive"}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Service" : "Add Service"}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Service Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Continuous Care Management" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this service include?" rows={3} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Price Label</label>
            <Input value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} placeholder="e.g. $149/mo or Custom" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="svc-enabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 rounded accent-primary" />
            <label htmlFor="svc-enabled" className="text-sm">Enabled</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editItem ? "Update" : "Add"}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

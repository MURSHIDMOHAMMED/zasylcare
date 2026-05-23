"use client";

import { useState } from "react";
import { Download, Eye, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { leadStatuses, type LeadStatus } from "@/constants/statuses";
import type { Lead } from "@/types/lead.types";

const statusOptions = leadStatuses;

const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Reschedule Requested": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Confirmed: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
};

export function LeadTable({ leads }: { leads: Lead[] }) {
  const [rows, setRows] = useState(leads);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [filter, setFilter] = useState("");
  const { toast } = useToast();

  const filtered = rows.filter((lead) => {
    if (!filter) return true;
    const search = filter.toLowerCase();
    return (
      lead.customerName.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      lead.serviceInterest.toLowerCase().includes(search) ||
      lead.status.toLowerCase().includes(search)
    );
  });

  function exportCSV() {
    const header = "Name,Email,Phone,Service,Booking Date,Booking Time,Source,Score,Status,Created";
    const csvRows = rows.map((lead) =>
      [
        lead.customerName,
        lead.email,
        lead.phone,
        lead.serviceInterest,
        lead.bookingDate ?? "",
        lead.bookingTime ?? "",
        lead.leadSource,
        lead.leadScore,
        lead.status,
        new Date(lead.createdAt).toLocaleDateString()
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Leads exported to CSV.");
  }

  function updateStatus(leadId: string, newStatus: LeadStatus) {
    setRows((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() } : lead
      )
    );
    if (detailLead?.id === leadId) {
      setDetailLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    toast(`Lead status updated to ${newStatus}.`);
  }

  function deleteLead(leadId: string) {
    if (!confirm("Delete this lead permanently?")) return;
    setRows((prev) => prev.filter((lead) => lead.id !== leadId));
    if (detailLead?.id === leadId) setDetailLead(null);
    toast("Lead deleted.");
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h2 className="font-semibold">Lead CRM</h2>
            <p className="text-sm text-muted-foreground">Customer details, source, score, and booking interest.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="h-9 w-48 rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
              placeholder="Filter leads..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button variant="secondary" onClick={exportCSV}>
              <Download className="h-4 w-4" />Export
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {["Customer", "Service", "Booking", "Source", "Score", "Status", "Created", "Actions"].map((head) => (
                  <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30">
                  <td className="px-4 py-4">
                    <p className="font-medium">{lead.customerName}</p>
                    <p className="text-xs text-muted-foreground">{lead.email} · {lead.phone}</p>
                  </td>
                  <td className="px-4 py-4">{lead.serviceInterest}</td>
                  <td className="px-4 py-4">{lead.bookingDate ?? "Not requested"} {lead.bookingTime ?? ""}</td>
                  <td className="px-4 py-4">{lead.leadSource}</td>
                  <td className="px-4 py-4">
                    <span className={`font-semibold ${lead.leadScore >= 70 ? "text-emerald-600" : lead.leadScore >= 40 ? "text-amber-600" : "text-muted-foreground"}`}>
                      {lead.leadScore}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold outline-none ${statusColors[lead.status] ?? "bg-muted text-muted-foreground"}`}
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <button
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
                        onClick={() => setDetailLead(lead)}
                        aria-label="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => deleteLead(lead.id)}
                        aria-label="Delete lead"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <Modal open={!!detailLead} onClose={() => setDetailLead(null)} title="Lead Details">
        {detailLead && (
          <div className="space-y-4">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div><span className="text-muted-foreground">Name:</span> <strong>{detailLead.customerName}</strong></div>
              <div><span className="text-muted-foreground">Email:</span> <strong>{detailLead.email}</strong></div>
              <div><span className="text-muted-foreground">Phone:</span> <strong>{detailLead.phone}</strong></div>
              <div><span className="text-muted-foreground">Service:</span> <strong>{detailLead.serviceInterest}</strong></div>
              <div><span className="text-muted-foreground">Source:</span> <strong>{detailLead.leadSource}</strong></div>
              <div><span className="text-muted-foreground">Score:</span> <strong>{detailLead.leadScore}</strong></div>
              <div><span className="text-muted-foreground">Booking:</span> <strong>{detailLead.bookingDate ?? "N/A"} {detailLead.bookingTime ?? ""}</strong></div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <select
                  className={`ml-1 rounded-full px-2.5 py-1 text-xs font-semibold outline-none ${statusColors[detailLead.status] ?? "bg-muted"}`}
                  value={detailLead.status}
                  onChange={(e) => updateStatus(detailLead.id, e.target.value as LeadStatus)}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            {detailLead.notes && (
              <div className="rounded-lg bg-muted/40 p-3 text-sm">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">Notes</p>
                <p>{detailLead.notes}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="danger" onClick={() => { deleteLead(detailLead.id); }}>
                <Trash2 className="h-4 w-4" />Delete Lead
              </Button>
              <Button variant="secondary" onClick={() => setDetailLead(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

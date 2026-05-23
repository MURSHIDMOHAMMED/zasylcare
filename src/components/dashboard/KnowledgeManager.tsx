"use client";

import { useState } from "react";
import { Check, Edit, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import type { CompanyKnowledge } from "@/types/company.types";

const categoryOptions = ["Company Info", "Services", "FAQ", "Pricing", "Policy", "Offer", "Location", "Hours"] as const;
type KnowledgeCategory = CompanyKnowledge["category"];

export function KnowledgeManager({ initial }: { initial: CompanyKnowledge[] }) {
  const [items, setItems] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CompanyKnowledge | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory>("Company Info");
  const [content, setContent] = useState("");
  const [enabled, setEnabled] = useState(true);

  function openAdd() {
    setEditItem(null);
    setTitle("");
    setCategory("Company Info");
    setContent("");
    setEnabled(true);
    setModalOpen(true);
  }

  function openEdit(item: CompanyKnowledge) {
    setEditItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setContent(item.content);
    setEnabled(item.enabled);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast("Title and content are required.", "error");
      return;
    }

    setSaving(true);

    if (editItem) {
      // Update existing item
      const response = await fetch(`/api/knowledge/${editItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content, enabled })
      });

      if (response.ok) {
        const data = await response.json();
        setItems((prev) =>
          prev.map((item) =>
            item.id === editItem.id
              ? { ...item, title, category, content, enabled, updatedAt: new Date().toISOString() }
              : item
          )
        );
        toast("Knowledge updated successfully.");
      } else {
        toast("Failed to update knowledge.", "error");
      }
    } else {
      // Create new item
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: "00000000-0000-4000-8000-000000000001",
          title,
          category,
          content,
          enabled
        })
      });

      if (response.ok) {
        const data = await response.json();
        const now = new Date().toISOString();
        const newItem: CompanyKnowledge = {
          id: data.knowledge?.id ?? crypto.randomUUID(),
          companyId: "00000000-0000-4000-8000-000000000001",
          title,
          category,
          content,
          enabled,
          createdAt: now,
          updatedAt: now
        };
        setItems((prev) => [newItem, ...prev]);
        toast("Knowledge added successfully.");
      } else {
        toast("Failed to add knowledge.", "error");
      }
    }

    setSaving(false);
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this knowledge entry?")) return;

    setDeletingId(id);
    const response = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });

    if (response.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast("Knowledge deleted.");
    } else {
      toast("Failed to delete knowledge.", "error");
    }
    setDeletingId(null);
  }

  async function handleToggle(item: CompanyKnowledge) {
    const newEnabled = !item.enabled;
    const response = await fetch(`/api/knowledge/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: newEnabled })
    });

    if (response.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, enabled: newEnabled } : i))
      );
      toast(newEnabled ? "Knowledge enabled." : "Knowledge disabled.", "info");
    }
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h1 className="text-xl font-semibold">Company Knowledge Base</h1>
            <p className="text-sm text-muted-foreground">Only enabled records are used by the AI receptionist.</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />Add knowledge
          </Button>
        </div>
        <div className="divide-y">
          {items.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No knowledge entries yet. Click &quot;Add knowledge&quot; to get started.
            </div>
          )}
          {items.map((item) => (
            <article key={item.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{item.title}</h2>
                  <Badge>{item.category}</Badge>
                  {item.enabled ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <Check className="mr-1 h-3 w-3" />Enabled
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Disabled</Badge>
                  )}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{item.content}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  aria-label="Toggle"
                  onClick={() => handleToggle(item)}
                  className="h-9"
                >
                  {item.enabled ? "Disable" : "Enable"}
                </Button>
                <Button variant="secondary" aria-label="Edit" onClick={() => openEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger"
                  aria-label="Delete"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Knowledge" : "Add Knowledge"}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Service Packages" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <select
              className="h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
              value={category}
              onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Information the AI receptionist will use to answer questions..."
              rows={4}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="kb-enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <label htmlFor="kb-enabled" className="text-sm">Enable for AI receptionist</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editItem ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

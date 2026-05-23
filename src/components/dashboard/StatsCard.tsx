import type { LucideIcon } from "lucide-react";

export function StatsCard({ title, value, helper, icon: Icon }: { title: string; value: string | number; helper: string; icon: LucideIcon }) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{helper}</p>
    </div>
  );
}

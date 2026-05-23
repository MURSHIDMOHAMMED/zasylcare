import { GripVertical, ToggleLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function FormField({ label, type, required }: { label: string; type: string; required?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{type}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {required && <Badge>Required</Badge>}
        <ToggleLeft className="h-5 w-5 text-primary" />
      </div>
    </div>
  );
}

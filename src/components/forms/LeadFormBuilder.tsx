import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";

const fields = [
  { label: "Budget", type: "Number", required: false },
  { label: "Location", type: "Text", required: true },
  { label: "Consultation type", type: "Select", required: true },
  { label: "Company size", type: "Conditional", required: false }
];

export function LeadFormBuilder() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Custom Lead Form Builder</h2>
          <p className="text-sm text-muted-foreground">Create required, optional, ordered, and conditional questions.</p>
        </div>
        <Button><Plus className="h-4 w-4" />Add field</Button>
      </div>
      <div className="space-y-3">
        {fields.map((field) => <FormField key={field.label} {...field} />)}
      </div>
    </div>
  );
}

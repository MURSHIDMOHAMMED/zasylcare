import { LeadTable } from "@/components/dashboard/LeadTable";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { listLeads } from "@/services/lead.service";

export default async function LeadsPage() {
  const leads = await listLeads();

  return (
    <div className="space-y-6">
      <DynamicForm />
      <LeadTable leads={leads} />
    </div>
  );
}

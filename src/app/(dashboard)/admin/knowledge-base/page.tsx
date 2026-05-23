import { KnowledgeManager } from "@/components/dashboard/KnowledgeManager";
import { getEnabledKnowledge } from "@/services/knowledge.service";

export const dynamic = "force-dynamic";

const demoCompanyId = "00000000-0000-4000-8000-000000000001";

export default async function KnowledgeBasePage() {
  const knowledge = await getEnabledKnowledge(demoCompanyId);
  return <KnowledgeManager initial={knowledge} />;
}

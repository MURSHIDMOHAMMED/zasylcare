import { promises as fs } from "fs";
import path from "path";
import { createSupabaseServiceClient } from "@/lib/supabase";
import type { CompanyKnowledge } from "@/types/company.types";

export const demoKnowledge: CompanyKnowledge[] = [
  {
    id: "kb-1",
    companyId: "00000000-0000-4000-8000-000000000001",
    title: "Company Overview",
    category: "Company Info",
    content: "Zasilcare Health provides healthcare support and consultation services focused on continuous healthcare management for patients, especially people with ongoing health conditions.",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "kb-2",
    companyId: "00000000-0000-4000-8000-000000000001",
    title: "Healthcare Support",
    category: "Services",
    content: "Zasilcare Health helps patients coordinate care, understand next steps, and request consultation support for ongoing healthcare needs.",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "kb-3",
    companyId: "00000000-0000-4000-8000-000000000001",
    title: "Consultation Process",
    category: "FAQ",
    content: "Patients can request a consultation by sharing their concern, preferred date and time, and contact details. The care team reviews the request and follows up with next steps.",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const demoCompanyId = "00000000-0000-4000-8000-000000000001";
const demoKnowledgeStorePath = path.join(process.cwd(), ".demo-knowledge.json");

type KnowledgeRow = {
  id: string;
  company_id: string;
  title: string;
  category: CompanyKnowledge["category"];
  content: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

function mapKnowledgeRow(item: KnowledgeRow): CompanyKnowledge {
  return {
    id: item.id,
    companyId: item.company_id,
    title: item.title,
    category: item.category,
    content: item.content,
    enabled: item.enabled,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

function isOldAcmeKnowledge(item: Pick<CompanyKnowledge, "title" | "category" | "content">) {
  return /acme|growth studio|acmegrowth/i.test(`${item.title} ${item.category} ${item.content}`);
}

async function readStoredDemoKnowledge(): Promise<CompanyKnowledge[]> {
  try {
    const raw = await fs.readFile(demoKnowledgeStorePath, "utf8");
    const parsed = JSON.parse(raw) as CompanyKnowledge[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStoredDemoKnowledge(items: CompanyKnowledge[]) {
  await fs.writeFile(demoKnowledgeStorePath, JSON.stringify(items, null, 2));
}

export async function getDemoKnowledge(): Promise<CompanyKnowledge[]> {
  const stored = await readStoredDemoKnowledge();
  const storedIds = new Set(stored.map((item) => item.id));
  return [...stored, ...demoKnowledge.filter((item) => !storedIds.has(item.id))];
}

export async function createDemoKnowledge(input: {
  title: string;
  category: CompanyKnowledge["category"];
  content: string;
  enabled: boolean;
}): Promise<CompanyKnowledge> {
  const now = new Date().toISOString();
  const newItem: CompanyKnowledge = {
    id: `kb-${Date.now()}`,
    companyId: demoCompanyId,
    title: input.title,
    category: input.category,
    content: input.content,
    enabled: input.enabled,
    createdAt: now,
    updatedAt: now
  };
  const stored = await readStoredDemoKnowledge();
  await writeStoredDemoKnowledge([newItem, ...stored]);
  return newItem;
}

export async function updateDemoKnowledge(
  id: string,
  updates: Partial<Pick<CompanyKnowledge, "title" | "category" | "content" | "enabled">>
): Promise<CompanyKnowledge | null> {
  const allItems = await getDemoKnowledge();
  const item = allItems.find((entry) => entry.id === id);
  if (!item) return null;
  const definedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  ) as Partial<Pick<CompanyKnowledge, "title" | "category" | "content" | "enabled">>;

  const updatedItem = {
    ...item,
    ...definedUpdates,
    updatedAt: new Date().toISOString()
  };
  const stored = await readStoredDemoKnowledge();
  const storedIds = new Set(stored.map((entry) => entry.id));
  const nextStored = storedIds.has(id)
    ? stored.map((entry) => (entry.id === id ? updatedItem : entry))
    : [updatedItem, ...stored];

  await writeStoredDemoKnowledge(nextStored);
  return updatedItem;
}

export async function deleteDemoKnowledge(id: string): Promise<boolean> {
  const allItems = await getDemoKnowledge();
  if (!allItems.some((item) => item.id === id)) return false;

  const stored = await readStoredDemoKnowledge();
  const nextStored = stored.filter((item) => item.id !== id);
  await writeStoredDemoKnowledge(nextStored);
  return true;
}

export async function getEnabledKnowledge(companyId: string): Promise<CompanyKnowledge[]> {
  let data = null;
  let error = null;

  try {
    const supabase = createSupabaseServiceClient();
    const response = await supabase
      .from("company_knowledge")
      .select("*")
      .eq("company_id", companyId)
      .eq("enabled", true)
      .order("category");
    data = response.data;
    error = response.error;
  } catch {
    if (companyId === "demo-company" || companyId === "zasilcare-health" || companyId === demoCompanyId) {
      return getDemoKnowledge();
    }

    return [];
  }

  if (error || !data) {
    if (companyId === "demo-company" || companyId === "zasilcare-health" || companyId === demoCompanyId) {
      return getDemoKnowledge();
    }

    return [];
  }

  const mappedKnowledge = data.map((item) =>
    mapKnowledgeRow({
      ...item,
      category: item.category as CompanyKnowledge["category"]
    })
  );
  const cleanKnowledge = mappedKnowledge.filter((item) => !isOldAcmeKnowledge(item));
  const hasOldDemoKnowledge = companyId === demoCompanyId && cleanKnowledge.length !== mappedKnowledge.length;

  if (hasOldDemoKnowledge) {
    const fallback = await getDemoKnowledge();
    const existingIds = new Set(cleanKnowledge.map((item) => item.id));
    return [...cleanKnowledge, ...fallback.filter((item) => !existingIds.has(item.id))];
  }

  return mappedKnowledge;
}

export function knowledgeToContext(knowledge: CompanyKnowledge[]) {
  return knowledge.map((item) => `[${item.category}] ${item.title}: ${item.content}`).join("\n");
}

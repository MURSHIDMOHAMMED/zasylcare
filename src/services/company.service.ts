import { createSupabaseServiceClient } from "@/lib/supabase";
import type { Company } from "@/types/company.types";

export const demoCompany: Company = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "zasyl.care",
  slug: "zasyl-care",
  primaryColor: "#0f766e",
  supportEmail: "support@zasyl.care",
  phone: "+1 555 010 2040",
  timezone: "America/New_York",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const demoCompanyId = "00000000-0000-4000-8000-000000000001";
const demoCompanyAliases = ["demo-company", "zasilcare-health", "zasyl-care"];

export async function getCompanyBySlugOrId(companyId: string): Promise<Company | null> {
  const fallbackRequested = demoCompanyAliases.includes(companyId) || companyId === demoCompany.id;
  let data = null;
  let error = null;

  try {
    const supabase = createSupabaseServiceClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(companyId);
    const query = supabase.from("companies").select("*");
    const response = isUuid
      ? await query.eq("id", companyId).single()
      : await query.eq("slug", companyId).single();
    data = response.data;
    error = response.error;
  } catch {
    if (fallbackRequested) return demoCompany;
    return null;
  }

  if (error || !data) {
    if (fallbackRequested) {
      return demoCompany;
    }

    return null;
  }

  if (data.id === demoCompanyId && /acme|growth studio/i.test(data.name)) {
    return demoCompany;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logoUrl: data.logo_url,
    website: data.website,
    primaryColor: data.primary_color,
    supportEmail: data.support_email,
    phone: data.phone,
    timezone: data.timezone,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

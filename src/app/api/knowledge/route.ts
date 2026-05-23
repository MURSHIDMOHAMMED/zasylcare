import { NextResponse } from "next/server";
import { knowledgeSchema } from "@/lib/validations";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { createDemoKnowledge, getDemoKnowledge } from "@/services/knowledge.service";

const demoCompanyId = "00000000-0000-4000-8000-000000000001";

export async function GET() {
  return NextResponse.json({ knowledge: await getDemoKnowledge() });
}

export async function POST(request: Request) {
  const parsed = knowledgeSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid knowledge payload", issues: parsed.error.flatten() }, { status: 400 });

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("company_knowledge")
    .insert({
      company_id: parsed.data.companyId,
      title: parsed.data.title,
      category: parsed.data.category,
      content: parsed.data.content,
      enabled: parsed.data.enabled
    })
    .select()
    .single();

  if (error) {
    if (parsed.data.companyId === demoCompanyId) {
      const newItem = await createDemoKnowledge(parsed.data);
      return NextResponse.json({ knowledge: newItem }, { status: 201 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ knowledge: data }, { status: 201 });
}

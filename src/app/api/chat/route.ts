import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { chatRequestSchema } from "@/lib/validations";
import { generateChatbotResponse } from "@/services/ai.service";
import { demoCompany, getCompanyBySlugOrId } from "@/services/company.service";
import { getDemoKnowledge, getEnabledKnowledge } from "@/services/knowledge.service";
import { saveLeadMessage } from "@/services/lead.service";

export async function POST(request: Request) {
  const limited = rateLimit(`chat:${request.headers.get("x-forwarded-for") ?? "local"}`);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many chat requests" }, { status: 429 });
  }

  const parsed = chatRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const company = await getCompanyBySlugOrId(parsed.data.companyId).catch(() => demoCompany);
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const knowledge = await getEnabledKnowledge(company.id).catch(() => getDemoKnowledge());

  await saveLeadMessage({
    companyId: company.id,
    sessionId: parsed.data.sessionId,
    role: "user",
    content: parsed.data.message
  }).catch(() => undefined);

  const aiResponse = await generateChatbotResponse({
    message: parsed.data.message,
    history: parsed.data.history,
    knowledge
  }).catch(() => ({
    message: "zasyl.care provides healthcare support and consultation services for patients, especially people managing ongoing health conditions. Please share your concern, and our care team can guide you on the next step.",
    quickReplies: ["Chat With Us", "Discuss Health Needs", "Call Booking", "Care Availability"],
    shouldCollectLead: true,
    intent: "support" as const
  }));

  await saveLeadMessage({
    companyId: company.id,
    sessionId: parsed.data.sessionId,
    role: "assistant",
    content: aiResponse.message
  }).catch(() => undefined);

  return NextResponse.json(aiResponse);
}

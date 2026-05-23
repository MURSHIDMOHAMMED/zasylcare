import { notFound } from "next/navigation";
import { ChatWindow } from "@/components/chatbot/ChatWindow";
import { getCompanyBySlugOrId } from "@/services/company.service";

export default async function ChatbotPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const company = await getCompanyBySlugOrId(companyId);

  if (!company) notFound();

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <ChatWindow companyId={company.id} companyName={company.name} />
    </main>
  );
}

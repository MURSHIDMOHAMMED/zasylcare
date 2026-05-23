import { CHATBOT_SYSTEM_PROMPT } from "@/constants/prompts";
import { generateGroqChatCompletion } from "@/lib/groq";
import { sanitizeForPrompt } from "@/lib/utils";
import { knowledgeToContext } from "@/services/knowledge.service";
import type { ChatMessage, ChatResponse } from "@/types/chatbot.types";
import type { CompanyKnowledge } from "@/types/company.types";

function detectIntent(message: string): ChatResponse["intent"] {
  const lower = message.toLowerCase();
  if (/(book|call|consult|appointment|schedule|demo)/.test(lower)) return "booking_interest";
  if (/(price|pricing|package|cost|fee)/.test(lower)) return "pricing";
  if (/(support|help|issue|problem)/.test(lower)) return "support";
  if (/(service|offer|do you)/.test(lower)) return "question";
  return "unknown";
}

function localKnowledgeFallback(input: {
  message: string;
  knowledge: CompanyKnowledge[];
  shouldCollectLead: boolean;
  intent: ChatResponse["intent"];
}): ChatResponse {
  const words = input.message
    .toLowerCase()
    .split(/\W+/)
    .map((word) => word.replace(/s$/, ""))
    .filter((word) => word.length > 2);
  const intentTerms: Record<ChatResponse["intent"], string[]> = {
    pricing: ["pricing", "price", "package", "cost", "fee"],
    booking_interest: ["consultation", "booking", "appointment", "schedule", "call"],
    support: ["support", "help", "issue", "problem"],
    question: ["service", "offer", "company", "overview"],
    unknown: []
  };
  const searchTerms = [...words, ...intentTerms[input.intent]];
  const matched = input.knowledge.find((item) => {
    const searchable = `${item.title} ${item.category} ${item.content}`.toLowerCase();
    return searchTerms.some((term) => searchable.includes(term));
  });
  const fallback =
    matched?.content ??
    "I'm sorry, I couldn't find that information in the company knowledge. Would you like our team to contact you directly?";

  return {
    message: input.shouldCollectLead ? `${fallback} Would you like to schedule a free consultation call with our team?` : fallback,
    quickReplies: input.shouldCollectLead ? ["Yes, schedule a call", "I have another question"] : ["Pricing", "Services", "Consultation process"],
    shouldCollectLead: input.shouldCollectLead,
    intent: input.intent
  };
}

export async function generateChatbotResponse(input: {
  message: string;
  history: Pick<ChatMessage, "role" | "content">[];
  knowledge: CompanyKnowledge[];
}): Promise<ChatResponse> {
  const intent = detectIntent(input.message);
  const shouldCollectLead = intent === "booking_interest" || /interested|sounds good|yes|talk to/i.test(input.message);
  const context = knowledgeToContext(input.knowledge);

  if (!context) {
    return {
      message: "I'm sorry, I couldn't find that information in the company knowledge. Would you like our team to contact you directly?",
      shouldCollectLead: true,
      intent
    };
  }

  const groqMessage = await generateGroqChatCompletion({
    context,
    history: input.history,
    message: input.message
  }).catch(() => null);

  if (groqMessage) {
    return {
      message: groqMessage,
      quickReplies: shouldCollectLead ? ["Yes, schedule a call", "Not yet"] : ["Pricing", "Services", "Talk to team"],
      shouldCollectLead,
      intent
    };
  }

  return localKnowledgeFallback({
    message: input.message,
    knowledge: input.knowledge,
    shouldCollectLead,
    intent
  });
}

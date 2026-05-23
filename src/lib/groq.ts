import { CHATBOT_SYSTEM_PROMPT } from "@/constants/prompts";
import { sanitizeForPrompt } from "@/lib/utils";
import type { ChatMessage } from "@/types/chatbot.types";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function generateGroqChatCompletion(input: {
  context: string;
  history: Pick<ChatMessage, "role" | "content">[];
  message: string;
}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "your_groq_key") {
    return null;
  }

  const historyMessages: GroqMessage[] = input.history
    .slice(-10)
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: sanitizeForPrompt(message.content)
    }));

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
      temperature: 0.3,
      messages: [
        { role: "system", content: CHATBOT_SYSTEM_PROMPT },
        { role: "system", content: `Company knowledge:\n${sanitizeForPrompt(input.context)}` },
        ...historyMessages,
        { role: "user", content: sanitizeForPrompt(input.message) }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}`);
  }

  const data = (await response.json()) as GroqChatCompletion;
  return data.choices?.[0]?.message?.content ?? null;
}

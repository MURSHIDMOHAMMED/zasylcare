export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ChatResponse = {
  message: string;
  quickReplies?: string[];
  shouldCollectLead: boolean;
  intent: "question" | "support" | "pricing" | "booking_interest" | "unknown";
};

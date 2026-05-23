"use client";

import { useMemo, useState } from "react";
import type { ChatMessage } from "@/types/chatbot.types";

const greeting = "Hi, welcome to zasyl.care. Please tell us about yourself, who needs care, and where you are located. Is the service for you, your parent, father, mother, or another family member?\n\nനമസ്കാരം, zasyl.care-ലേക്ക് സ്വാഗതം. നിങ്ങളെക്കുറിച്ച്, പരിചരണം ആവശ്യമായത് ആര്‍ക്കാണ്, നിങ്ങൾ എവിടെയാണ് എന്നതും പറയൂ. ഈ സേവനം നിങ്ങൾക്കാണോ, നിങ്ങളുടെ മാതാപിതാക്കൾക്കാണോ, അച്ഛനാണോ, അമ്മയാണോ, അല്ലെങ്കിൽ മറ്റൊരു കുടുംബാംഗത്തിനാണോ?";
const defaultQuickReplies = ["Chat With Us", "Discuss Health Needs", "Call Booking", "Care Availability"];

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useChatbot(companyId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "greeting", role: "assistant", content: greeting, createdAt: new Date().toISOString() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState(defaultQuickReplies);
  const [isCollectingLead, setIsCollectingLead] = useState(false);
  const sessionId = useMemo(() => createClientId(), []);

  async function sendMessage(content: string) {
    const userMessage: ChatMessage = { id: createClientId(), role: "user", content, createdAt: new Date().toISOString() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          sessionId,
          message: content,
          history: nextMessages.map(({ role, content }) => ({ role, content }))
        })
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: createClientId(),
        role: "assistant",
        content: data.message ?? "I'm sorry, I could not respond right now.",
        createdAt: new Date().toISOString()
      };

      setMessages((current) => [...current, assistantMessage]);
      setQuickReplies(data.quickReplies ?? []);
      setIsCollectingLead(Boolean(data.shouldCollectLead));
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createClientId(),
          role: "assistant",
          content: "I'm sorry, something went wrong. Please try again or leave your contact details for our team.",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function closeLeadCapture() {
    setIsCollectingLead(false);
    setQuickReplies(defaultQuickReplies);
  }

  function addAssistantMessage(content: string) {
    setMessages((current) => [
      ...current,
      { id: createClientId(), role: "assistant", content, createdAt: new Date().toISOString() }
    ]);
  }

  return { messages, isTyping, quickReplies, isCollectingLead, sendMessage, closeLeadCapture, addAssistantMessage };
}

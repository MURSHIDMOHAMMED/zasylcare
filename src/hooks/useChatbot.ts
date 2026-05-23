"use client";

import { useMemo, useState } from "react";
import type { ChatMessage } from "@/types/chatbot.types";

const greeting = [
  "Hello and welcome to ZasylCare.",
  "Please tell us a little about yourself, who requires care, and where they are located. Is this service for your father, mother, parents, yourself, or another family member?",
  "",
  "\u0d28\u0d2e\u0d38\u0d4d\u0d15\u0d3e\u0d30\u0d02, ZasylCare-\u0d32\u0d47\u0d15\u0d4d\u0d15\u0d4d \u0d38\u0d4d\u0d35\u0d3e\u0d17\u0d24\u0d02.",
  "\u0d26\u0d2f\u0d35\u0d3e\u0d2f\u0d3f \u0d28\u0d3f\u0d19\u0d4d\u0d19\u0d33\u0d46\u0d15\u0d4d\u0d15\u0d41\u0d31\u0d3f\u0d1a\u0d4d\u0d1a\u0d41\u0d02, \u0d2a\u0d30\u0d3f\u0d1a\u0d30\u0d23\u0d02 \u0d06\u0d35\u0d36\u0d4d\u0d2f\u0d2e\u0d41\u0d33\u0d4d\u0d33\u0d24\u0d4d \u0d06\u0d30\u0d4d\u0d15\u0d4d\u0d15\u0d3e\u0d23\u0d46\u0d28\u0d4d\u0d28\u0d41\u0d02, \u0d05\u0d35\u0d30\u0d4d \u0d0e\u0d35\u0d3f\u0d1f\u0d46\u0d2f\u0d3e\u0d23\u0d46\u0d28\u0d4d\u0d28\u0d41\u0d02 \u0d05\u0d31\u0d3f\u0d2f\u0d3f\u0d15\u0d4d\u0d15\u0d42. \u0d08 \u0d38\u0d47\u0d35\u0d28\u0d02 \u0d28\u0d3f\u0d19\u0d4d\u0d19\u0d33\u0d41\u0d1f\u0d46 \u0d05\u0d1a\u0d4d\u0d1b\u0d28\u0d4d, \u0d05\u0d2e\u0d4d\u0d2e\u0d2f\u0d4d\u0d15\u0d4d\u0d15\u0d4d, \u0d2e\u0d3e\u0d24\u0d3e\u0d2a\u0d3f\u0d24\u0d3e\u0d15\u0d4d\u0d15\u0d33\u0d4d\u0d15\u0d4d\u0d15\u0d4d, \u0d28\u0d3f\u0d19\u0d4d\u0d19\u0d33\u0d4d\u0d15\u0d4d\u0d15\u0d4b, \u0d05\u0d32\u0d4d\u0d32\u0d46\u0d19\u0d4d\u0d15\u0d3f\u0d32\u0d4d \u0d2e\u0d31\u0d4d\u0d31\u0d4a\u0d30\u0d41 \u0d15\u0d41\u0d1f\u0d41\u0d02\u0d2c\u0d3e\u0d02\u0d17\u0d24\u0d4d\u0d24\u0d3f\u0d28\u0d3e\u0d2f\u0d3e\u0d23\u0d4b?"
].join("\n");
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

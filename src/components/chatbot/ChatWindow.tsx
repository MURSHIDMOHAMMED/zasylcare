"use client";

import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { ChatInput } from "@/components/chatbot/ChatInput";
import { LeadCaptureCard } from "@/components/chatbot/LeadCaptureCard";
import { ChatMessage } from "@/components/chatbot/ChatMessage";
import { QuickReplies } from "@/components/chatbot/QuickReplies";
import { TypingIndicator } from "@/components/chatbot/TypingIndicator";
import { useChatbot } from "@/hooks/useChatbot";

export function ChatWindow({ companyId, companyName }: { companyId: string; companyName: string }) {
  const { messages, isTyping, quickReplies, isCollectingLead, sendMessage, closeLeadCapture, addAssistantMessage } = useChatbot(companyId);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <section className="mx-auto flex h-[min(760px,calc(100vh-48px))] w-full max-w-3xl flex-col overflow-hidden rounded-lg border bg-muted/40 shadow-soft">
      <header className="flex items-center gap-3 border-b bg-card p-4">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-semibold">{companyName}</h1>
          <p className="text-xs text-muted-foreground">Chat with us</p>
        </div>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
        {isTyping && <TypingIndicator />}
        {isCollectingLead && (
          <LeadCaptureCard
            companyId={companyId}
            onCancel={closeLeadCapture}
            onSaved={() => {
              closeLeadCapture();
              addAssistantMessage("Thanks, your consultation request is now pending. Our admin team will review it and confirm by email.");
            }}
          />
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t bg-card px-3 py-2">
        <QuickReplies replies={quickReplies} onPick={sendMessage} />
      </div>
      <ChatInput disabled={isTyping} onSend={sendMessage} />
    </section>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ChatInput({ disabled, onSend }: { disabled?: boolean; onSend: (message: string) => void }) {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setMessage("");
  }

  return (
    <form onSubmit={submit} className="flex gap-2 border-t bg-card p-3">
      <input
        className="min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
        disabled={disabled}
        placeholder="Type your question..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <Button disabled={disabled} aria-label="Send message">
        <SendHorizonal className="h-4 w-4" />
      </Button>
    </form>
  );
}

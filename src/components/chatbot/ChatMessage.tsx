import { cn } from "@/lib/utils";
import type { ChatMessage as Message } from "@/types/chatbot.types";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[82%] rounded-lg px-4 py-3 text-sm shadow-sm", isUser ? "bg-primary text-primary-foreground" : "bg-card")}>
        <p className="whitespace-pre-line leading-6">{message.content}</p>
        <p className={cn("mt-1 text-[11px]", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

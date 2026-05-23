import { Button } from "@/components/ui/Button";

export function QuickReplies({ replies, onPick }: { replies: string[]; onPick: (reply: string) => void }) {
  if (!replies.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {replies.map((reply) => (
        <Button key={reply} className="h-8 rounded-full px-3 text-xs" variant="secondary" onClick={() => onPick(reply)}>
          {reply}
        </Button>
      ))}
    </div>
  );
}

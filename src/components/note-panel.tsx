"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addOrderNote } from "@/app/actions";
import type { OrderNote } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export function NotePanel({
  orderId,
  notes,
}: {
  orderId: string;
  notes: OrderNote[];
}) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!body.trim()) return;
    startTransition(async () => {
      try {
        await addOrderNote({ orderId, body });
        setBody("");
      } catch {
        toast.error("Failed to add note");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {notes.length === 0 ? (
          <p className="text-xs text-muted-foreground">No notes yet.</p>
        ) : (
          [...notes]
            .reverse()
            .map((n) => (
              <div key={n.id} className="rounded-md border bg-card/40 p-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{n.author}</span>
                  <span>{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="text-xs mt-1 whitespace-pre-wrap">{n.body}</p>
              </div>
            ))
        )}
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add an internal note…"
        rows={2}
      />
      <Button
        size="sm"
        onClick={submit}
        disabled={pending || !body.trim()}
        className="w-full"
      >
        {pending ? "Saving…" : "Add note"}
      </Button>
    </div>
  );
}

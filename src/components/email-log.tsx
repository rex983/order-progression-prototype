"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { EmailLogEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export function EmailLog({ emails }: { emails: EmailLogEntry[] }) {
  const [open, setOpen] = useState<EmailLogEntry | null>(null);

  if (emails.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No emails logged yet. Progress a stage to fire the first one.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {[...emails].reverse().map((e) => (
          <button
            key={e.id}
            onClick={() => setOpen(e)}
            className="w-full text-left rounded-md border bg-card/40 p-3 hover:bg-accent/40 transition"
          >
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="font-mono">{e.templateKey}</span>
              <span>{formatDateTime(e.sentAt)}</span>
            </div>
            <div className="text-xs font-semibold mt-1">{e.subject}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              To {e.to} · {e.triggeredBy}
            </div>
          </button>
        ))}
      </div>
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{open?.subject}</DialogTitle>
            <DialogDescription>
              To {open?.to}
              {open?.cc ? ` · CC ${open.cc}` : ""}
              {open?.bcc ? ` · BCC ${open.bcc}` : ""}
              {" · "}
              {open ? formatDateTime(open.sentAt) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-md border bg-muted/30 p-4">
            <pre className="whitespace-pre-wrap text-xs font-sans leading-relaxed">
              {open?.body}
            </pre>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setOpen(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

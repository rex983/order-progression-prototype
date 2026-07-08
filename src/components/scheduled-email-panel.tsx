"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CalendarClock, X, CheckCircle2, Ban } from "lucide-react";
import { cancelScheduledEmail } from "@/app/actions";
import { formatDateTime } from "@/lib/format";
import type { ScheduledEmail } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function ScheduledEmailPanel({
  orderId,
  scheduled,
}: {
  orderId: string;
  scheduled: ScheduledEmail[];
}) {
  if (!scheduled || scheduled.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Nothing queued. Delayed templates enqueue here when their stage transition happens.
      </p>
    );
  }

  // Show pending first (most useful), then sent + canceled underneath.
  const sorted = [...scheduled].sort((a, b) => {
    const order = { pending: 0, sent: 1, canceled: 2 } as const;
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return a.sendAt.localeCompare(b.sendAt);
  });

  return (
    <div className="space-y-2">
      {sorted.map((s) => (
        <ScheduledEmailRow key={s.id} orderId={orderId} scheduled={s} />
      ))}
    </div>
  );
}

function ScheduledEmailRow({
  orderId,
  scheduled,
}: {
  orderId: string;
  scheduled: ScheduledEmail;
}) {
  const [pending, startTransition] = useTransition();
  const overdue =
    scheduled.status === "pending" &&
    new Date(scheduled.sendAt).getTime() < Date.now();

  function handleCancel() {
    if (!confirm("Cancel this scheduled email?")) return;
    startTransition(async () => {
      try {
        await cancelScheduledEmail({ orderId, scheduledId: scheduled.id });
        toast.success("Scheduled email canceled");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Cancel failed");
      }
    });
  }

  return (
    <div className="rounded-md border bg-card/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {scheduled.status === "pending" && (
            <CalendarClock className={`h-3.5 w-3.5 ${overdue ? "text-amber-500" : "text-muted-foreground"}`} />
          )}
          {scheduled.status === "sent" && (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          )}
          {scheduled.status === "canceled" && (
            <Ban className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-xs font-mono text-muted-foreground truncate">
            {scheduled.templateKey}
          </span>
        </div>
        {scheduled.status === "pending" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={pending}
            className="h-6 px-2 text-[10px]"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        )}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">
        {scheduled.status === "pending" && (
          <>
            {overdue ? "Overdue — will fire on next cron. " : "Scheduled for "}
            <strong className="text-foreground">{formatDateTime(scheduled.sendAt)}</strong>
          </>
        )}
        {scheduled.status === "sent" && (
          <>Sent {formatDateTime(scheduled.sentAt)}</>
        )}
        {scheduled.status === "canceled" && (
          <>Canceled {formatDateTime(scheduled.canceledAt)}{scheduled.canceledBy ? ` by ${scheduled.canceledBy}` : ""}</>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5 italic">
        {scheduled.triggeredBy}
      </div>
    </div>
  );
}

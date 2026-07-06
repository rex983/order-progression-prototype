"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/status-pill";
import {
  STAGE_DESCRIPTION,
  STAGE_LABEL,
  STAGE_ORDER,
  type Order,
  type StageKey,
  type StageStatus,
} from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { changeStageStatus } from "@/app/actions";
import { cn } from "@/lib/utils";

const STATUSES: StageStatus[] = ["pending", "waiting", "completed"];

const STATUS_TITLES: Record<StageStatus, string> = {
  pending: "Mark Pending",
  waiting: "Mark Waiting on Customer",
  completed: "Mark Completed",
};

export function StagePanel({
  order,
  previewSubjects,
}: {
  order: Order;
  previewSubjects: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      {STAGE_ORDER.map((stage, i) => {
        const state = order.stages[stage];
        const isCurrent = order.currentStage === stage;
        return (
          <Card
            key={stage}
            className={cn(
              "bg-card/40",
              isCurrent && "border-[var(--brand)]/50 shadow-[0_0_0_1px_var(--brand)]/10",
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full border grid place-items-center text-[10px] font-bold tabular-nums">
                      {i + 1}
                    </span>
                    <CardTitle className="text-sm">{STAGE_LABEL[stage]}</CardTitle>
                    <StatusPill status={state.status} />
                    {isCurrent ? (
                      <span className="text-[10px] uppercase tracking-wider text-[var(--brand)]">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <CardDescription className="mt-1.5">
                    {STAGE_DESCRIPTION[stage]}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-3 space-y-0.5">
                {state.updatedAt ? (
                  <div>
                    Last updated {formatDateTime(state.updatedAt)}
                    {state.updatedBy ? ` · by ${state.updatedBy}` : ""}
                  </div>
                ) : (
                  <div>No activity yet.</div>
                )}
                {state.note ? (
                  <div className="italic">&ldquo;{state.note}&rdquo;</div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <StageStatusButton
                    key={s}
                    orderId={order.id}
                    stage={stage}
                    status={s}
                    currentStatus={state.status}
                    previewSubject={previewSubjects[`${stage}_${s}`] ?? ""}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StageStatusButton({
  orderId,
  stage,
  status,
  currentStatus,
  previewSubject,
}: {
  orderId: string;
  stage: StageKey;
  status: StageStatus;
  currentStatus: StageStatus;
  previewSubject: string;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [pending, startTransition] = useTransition();

  const isCurrent = status === currentStatus;

  function submit() {
    startTransition(async () => {
      try {
        await changeStageStatus({
          orderId,
          stage,
          status,
          note: note.trim() || undefined,
          sendEmail,
        });
        toast.success(
          `${STAGE_LABEL[stage]} → ${status}${sendEmail ? " · email logged" : ""}`,
        );
        setOpen(false);
        setNote("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update");
      }
    });
  }

  return (
    <>
      <Button
        size="sm"
        variant={isCurrent ? "default" : "outline"}
        onClick={() => setOpen(true)}
        className={cn(
          isCurrent && status === "completed" && "bg-emerald-500 hover:bg-emerald-600",
          isCurrent && status === "waiting" && "bg-amber-500 hover:bg-amber-600",
        )}
      >
        {STATUS_TITLES[status]}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {STAGE_LABEL[stage]} → {status}
            </DialogTitle>
            <DialogDescription>
              This will update the stage status and — if enabled — log a customer email using the{" "}
              <strong>{`${stage}_${status}`}</strong> template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="note" className="text-xs">
                Internal note (optional)
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Left voicemail, waiting on callback"
                className="mt-1"
              />
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1">
              <div className="text-muted-foreground uppercase tracking-wider text-[10px]">
                Email preview
              </div>
              <div className="font-semibold">
                {previewSubject || "(no subject preview available)"}
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="accent-[var(--brand)]"
                />
                <span>Log customer email for this transition</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={pending}>
              {pending ? "Saving…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

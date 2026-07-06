"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleChecklistItem } from "@/app/actions";
import {
  CHECKLIST_LABEL,
  type ChecklistKey,
} from "@/lib/types";

const KEYS: ChecklistKey[] = [
  "welcome_call_made",
  "permitting",
  "land_prep",
  "scheduling",
  "delivery_install",
];

export function ChecklistPanel({
  orderId,
  checklist,
}: {
  orderId: string;
  checklist: Record<ChecklistKey, boolean>;
}) {
  const [, startTransition] = useTransition();

  function toggle(key: ChecklistKey, value: boolean) {
    startTransition(async () => {
      try {
        await toggleChecklistItem({ orderId, key, value });
      } catch {
        toast.error("Failed to toggle checklist item");
      }
    });
  }

  return (
    <div className="space-y-2">
      {KEYS.map((k) => (
        <label
          key={k}
          className="flex items-center gap-2 rounded-md border bg-card/40 px-3 py-2 text-xs cursor-pointer hover:bg-accent/40 transition"
        >
          <input
            type="checkbox"
            checked={checklist[k]}
            onChange={(e) => toggle(k, e.target.checked)}
            className="accent-[var(--brand)]"
          />
          <span className={checklist[k] ? "line-through text-muted-foreground" : ""}>
            {CHECKLIST_LABEL[k]}
          </span>
        </label>
      ))}
      <p className="text-[10px] text-muted-foreground pt-1">
        Completing a stage auto-ticks its linked checklist item(s).
      </p>
    </div>
  );
}

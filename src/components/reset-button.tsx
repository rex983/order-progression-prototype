"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resetPrototype } from "@/app/actions";

export function ResetButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!confirm("Wipe all prototype state and re-seed?")) return;
        startTransition(async () => {
          try {
            await resetPrototype();
            toast.success("Store reset to seed data");
          } catch {
            toast.error("Reset failed");
          }
        });
      }}
      disabled={pending}
    >
      {pending ? "Resetting…" : "Reset prototype to seed"}
    </Button>
  );
}

"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetAllEmailTemplates } from "@/app/actions";

export function ResetAllTemplatesButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (!confirm("Reset ALL email templates to defaults? Every edit is lost.")) return;
        startTransition(async () => {
          try {
            await resetAllEmailTemplates();
            toast.success("All templates reset to defaults");
          } catch {
            toast.error("Reset failed");
          }
        });
      }}
      disabled={pending}
    >
      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
      {pending ? "Resetting…" : "Reset all to defaults"}
    </Button>
  );
}

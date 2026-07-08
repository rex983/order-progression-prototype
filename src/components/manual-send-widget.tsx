"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { sendEmailNow } from "@/app/actions";
import type { EmailTemplateKey, StageKey, StageStatus } from "@/lib/types";
import {
  ALL_TEMPLATE_KEYS,
  STAGE_LABEL,
  STATUS_LABEL,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function parseKey(key: string): { stage: StageKey; status: StageStatus } {
  const parts = key.split("_");
  const status = parts.pop() as StageStatus;
  const stage = parts.join("_") as StageKey;
  return { stage, status };
}

export function ManualSendWidget({ orderId }: { orderId: string }) {
  const [key, setKey] = useState<EmailTemplateKey>(ALL_TEMPLATE_KEYS[0]);
  const [pending, startTransition] = useTransition();

  // Group templates by stage for the dropdown.
  const grouped: Record<StageKey, EmailTemplateKey[]> = {} as Record<StageKey, EmailTemplateKey[]>;
  for (const k of ALL_TEMPLATE_KEYS) {
    const { stage } = parseKey(k);
    if (!grouped[stage]) grouped[stage] = [];
    grouped[stage].push(k);
  }

  function handleSend() {
    if (!confirm("Send this email right now? It will be logged as a manual send.")) return;
    startTransition(async () => {
      try {
        await sendEmailNow({ orderId, templateKey: key });
        toast.success("Email sent — see the log below");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Send failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={key} onValueChange={(v) => setKey(v as EmailTemplateKey)}>
        <SelectTrigger className="h-8 flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(grouped) as StageKey[]).map((stage) => (
            <SelectGroup key={stage}>
              <SelectLabel className="text-[10px] uppercase tracking-wider">
                {STAGE_LABEL[stage]}
              </SelectLabel>
              {grouped[stage].map((k) => {
                const { status } = parseKey(k);
                return (
                  <SelectItem key={k} value={k}>
                    {STATUS_LABEL[status]}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" onClick={handleSend} disabled={pending}>
        <Send className="h-3.5 w-3.5 mr-1.5" />
        {pending ? "Sending…" : "Send"}
      </Button>
    </div>
  );
}

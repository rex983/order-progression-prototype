import Link from "next/link";
import { listTemplates } from "@/lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  STAGE_LABEL,
  STAGE_ORDER,
  STATUS_LABEL,
  TRIGGER_LABEL,
  type EmailTemplate,
  type StageKey,
  type StageStatus,
} from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { ChevronRight, EyeOff } from "lucide-react";
import { ResetAllTemplatesButton } from "@/components/reset-templates-button";

function parseKey(key: string): { stage: StageKey; status: StageStatus } {
  const parts = key.split("_");
  const status = parts.pop() as StageStatus;
  const stage = parts.join("_") as StageKey;
  return { stage, status };
}

function TemplateRow({ t }: { t: EmailTemplate }) {
  const { stage, status } = parseKey(t.key);
  return (
    <Link
      href={`/admin/emails/${t.key}`}
      className="flex items-center gap-3 rounded-md border bg-card/40 p-3 hover:bg-accent/40 transition"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">
            {t.key}
          </span>
          {!t.enabled && (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <EyeOff className="h-3 w-3" /> Disabled
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px]">
            {t.trigger === "delayed"
              ? `Delayed ${t.delayDays}d`
              : TRIGGER_LABEL[t.trigger]}
          </Badge>
        </div>
        <div className="text-sm font-medium mt-0.5 truncate">
          {t.subject || <span className="text-muted-foreground italic">(no subject)</span>}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          To {t.toType === "custom" ? t.toCustom || "(custom)" : "customer"}
          {t.cc ? ` · CC ${t.cc}` : ""}
          {t.bcc ? ` · BCC ${t.bcc}` : ""}
          {t.updatedAt ? ` · edited ${formatDateTime(t.updatedAt)}` : ""}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-semibold">{STATUS_LABEL[status]}</div>
        <div className="text-[10px] text-muted-foreground">
          {STAGE_LABEL[stage]}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}

export default async function EmailTemplatesPage() {
  const templates = await listTemplates();
  const byStage = new Map<StageKey, EmailTemplate[]>();
  for (const t of templates) {
    const { stage } = parseKey(t.key);
    if (!byStage.has(stage)) byStage.set(stage, []);
    byStage.get(stage)!.push(t);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            One template per stage + status. Edits go live immediately — every
            future stage change uses the current version.
          </p>
        </div>
        <ResetAllTemplatesButton />
      </div>

      {STAGE_ORDER.map((stage) => (
        <Card key={stage} className="bg-card/40">
          <CardHeader>
            <CardTitle className="text-sm">{STAGE_LABEL[stage]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {byStage.get(stage)?.map((t) => (
              <TemplateRow key={t.key} t={t} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

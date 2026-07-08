import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTemplate, listOrders } from "@/lib/store";
import { EmailTemplateEditor } from "@/components/email-template-editor";
import {
  ALL_TEMPLATE_KEYS,
  STAGE_LABEL,
  STATUS_LABEL,
  type EmailTemplateKey,
  type StageKey,
  type StageStatus,
} from "@/lib/types";

function parseKey(key: string): { stage: StageKey; status: StageStatus } {
  const parts = key.split("_");
  const status = parts.pop() as StageStatus;
  const stage = parts.join("_") as StageKey;
  return { stage, status };
}

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key: rawKey } = await params;
  if (!ALL_TEMPLATE_KEYS.includes(rawKey as EmailTemplateKey)) notFound();
  const key = rawKey as EmailTemplateKey;

  const [template, orders] = await Promise.all([getTemplate(key), listOrders()]);
  const { stage, status } = parseKey(key);

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <Link
          href="/admin/emails"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> All templates
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2">
          {STAGE_LABEL[stage]} · {STATUS_LABEL[status]}
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">{key}</p>
      </div>

      <EmailTemplateEditor template={template} sampleOrders={orders.slice(0, 6)} />
    </div>
  );
}

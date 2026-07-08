import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StagePipeline } from "@/components/stage-pipeline";
import { StagePanel } from "@/components/stage-panel";
import { ChecklistPanel } from "@/components/checklist-panel";
import { NotePanel } from "@/components/note-panel";
import { EmailLog } from "@/components/email-log";
import { ScheduledEmailPanel } from "@/components/scheduled-email-panel";
import { ManualSendWidget } from "@/components/manual-send-widget";
import { getOrder, listTemplates } from "@/lib/store";
import { renderTemplate } from "@/lib/emails";
import {
  STAGE_LABEL,
  STAGE_ORDER,
} from "@/lib/types";
import { formatDate } from "@/lib/format";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const templates = await listTemplates();
  const previewSubjects: Record<string, string> = {};
  for (const t of templates) {
    previewSubjects[t.key] = renderTemplate(t, order).subject;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to queue
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-muted-foreground">
              {order.customerName} · {STAGE_LABEL[order.currentStage]}
            </p>
          </div>
          <div className="w-full sm:w-80">
            <StagePipeline stages={order.stages} size="md" />
            <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              {STAGE_ORDER.map((s) => (
                <span key={s} className="flex-1 text-center">
                  {STAGE_LABEL[s].split(" ")[0]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StagePanel order={order} previewSubjects={previewSubjects} />

          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm">Send email now</CardTitle>
            </CardHeader>
            <CardContent>
              <ManualSendWidget orderId={order.id} />
              <p className="text-[11px] text-muted-foreground mt-2">
                Fire any template immediately using its current saved version. Useful for a resend or for templates set to <em>Manual only</em>.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm">Scheduled emails</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduledEmailPanel
                orderId={order.id}
                scheduled={order.scheduledEmails ?? []}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm">Customer email log</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailLog emails={order.emails} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm">Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="font-semibold text-sm">{order.customerName}</div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3 w-3" /> {order.customerEmail}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3 w-3" /> {order.customerPhone}
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3 mt-0.5" />
                <span>
                  {order.address}
                  <br />
                  {order.city}, {order.state}
                </span>
              </div>
              <div className="pt-2 border-t space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3 w-3" /> {order.buildingSize} · {order.buildingType}
                </div>
                <div className="text-muted-foreground">
                  Mfr: <strong className="text-foreground">{order.manufacturer}</strong>
                </div>
                <div className="text-muted-foreground">
                  Sales rep: <strong className="text-foreground">{order.salesRep}</strong>
                </div>
                <div className="text-muted-foreground">
                  STM date: <strong className="text-foreground">{formatDate(order.stmDate)}</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm">Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ChecklistPanel orderId={order.id} checklist={order.checklist} />
            </CardContent>
          </Card>

          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm">Internal notes</CardTitle>
            </CardHeader>
            <CardContent>
              <NotePanel orderId={order.id} notes={order.notes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

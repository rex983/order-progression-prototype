import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StagePipeline } from "@/components/stage-pipeline";
import { StatusPill } from "@/components/status-pill";
import { listOrders } from "@/lib/store";
import { STAGE_LABEL, STAGE_ORDER, type StageKey } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type SP = { stage?: string; filter?: string };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const orders = await listOrders();

  const stageFilter =
    sp.stage && STAGE_ORDER.includes(sp.stage as StageKey)
      ? (sp.stage as StageKey)
      : undefined;
  const waitingOnly = sp.filter === "waiting";

  const filtered = orders.filter((o) => {
    if (stageFilter && o.currentStage !== stageFilter) return false;
    if (waitingOnly) {
      return Object.values(o.stages).some((s) => s.status === "waiting");
    }
    return true;
  });

  const tabs = [
    { label: "All", href: "/orders", active: !stageFilter && !waitingOnly },
    ...STAGE_ORDER.map((s) => ({
      label: STAGE_LABEL[s],
      href: `/orders?stage=${s}`,
      active: stageFilter === s,
    })),
    {
      label: "Waiting on Customer",
      href: "/orders?filter=waiting",
      active: waitingOnly,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post-STM Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Orders that have been sent to the manufacturer. Work them through the four stages.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "px-3 py-2 text-xs -mb-px border-b-2 transition",
              t.active
                ? "border-[var(--brand)] text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border bg-card/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Mfr</TableHead>
              <TableHead>Current Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pipeline</TableHead>
              <TableHead>STM</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">
                  #{o.orderNumber}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{o.customerName}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {o.city}, {o.state}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {o.buildingSize}
                  <div className="text-[10px] text-muted-foreground">
                    {o.buildingType}
                  </div>
                </TableCell>
                <TableCell className="text-xs">{o.manufacturer}</TableCell>
                <TableCell className="text-xs">
                  {STAGE_LABEL[o.currentStage]}
                </TableCell>
                <TableCell>
                  <StatusPill status={o.stages[o.currentStage].status} />
                </TableCell>
                <TableCell className="w-[180px]">
                  <StagePipeline stages={o.stages} />
                </TableCell>
                <TableCell className="text-[10px] text-muted-foreground">
                  {formatDate(o.stmDate)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/orders/${o.id}`}
                    className="inline-flex items-center gap-1 text-xs text-[var(--brand)] hover:underline"
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  No orders in this view.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

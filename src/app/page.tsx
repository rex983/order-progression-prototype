import Link from "next/link";
import { ArrowRight, PhoneCall, Hammer, CalendarClock, PackageCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listOrders } from "@/lib/store";
import { STAGE_ORDER, STAGE_LABEL, type StageKey } from "@/lib/types";

const STAGE_ICON: Record<StageKey, React.ReactNode> = {
  welcome_call: <PhoneCall className="h-4 w-4" />,
  land_prep_permitting: <Hammer className="h-4 w-4" />,
  ready_for_install: <CalendarClock className="h-4 w-4" />,
  scheduled: <PackageCheck className="h-4 w-4" />,
};

export default async function Home() {
  const orders = await listOrders();

  const perStage: Record<StageKey, number> = {
    welcome_call: 0,
    land_prep_permitting: 0,
    ready_for_install: 0,
    scheduled: 0,
  };
  for (const o of orders) {
    if (o.stages[o.currentStage].status !== "completed") {
      perStage[o.currentStage] += 1;
    }
  }
  const completedCount = orders.filter(
    (o) => o.currentStage === "scheduled" && o.stages.scheduled.status === "completed",
  ).length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post-STM Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Once an order is sent to the manufacturer, the Building Success Team walks it through four
          stages. Each transition fires a templated email to the customer.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGE_ORDER.map((stage) => (
          <DashCard
            key={stage}
            href={`/orders?stage=${stage}`}
            icon={STAGE_ICON[stage]}
            title={STAGE_LABEL[stage]}
            description={
              stage === "welcome_call"
                ? "BST introduces themselves and confirms details."
                : stage === "land_prep_permitting"
                  ? "Customer preps their land and pulls permits."
                  : stage === "ready_for_install"
                    ? "Scheduling team locks in a build slot."
                    : "Delivery + install date locked and communicated."
            }
            count={perStage[stage]}
            countLabel="orders in this stage"
          />
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">How it works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>Order lands in the Post-STM Queue once the manufacturer receives it.</li>
              <li>BST opens the order and works the current stage.</li>
              <li>
                Each stage can be marked <strong>pending</strong>,{" "}
                <strong>waiting on customer</strong>, or <strong>completed</strong>.
              </li>
              <li>
                Every status change fires a customer email and ticks the linked checklist item.
              </li>
              <li>Completing a stage advances the order to the next stage automatically.</li>
            </ol>
          </CardContent>
        </Card>
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Recently delivered</CardTitle>
            <CardDescription>Buildings marked Scheduled → Completed</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold tabular-nums">
            {completedCount}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function DashCard({
  href,
  icon,
  title,
  description,
  count,
  countLabel,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  countLabel: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full bg-card/40 hover:border-[var(--brand)]/60 transition">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              {icon}
              <span>{title}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--brand)] transition" />
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums mt-2">
            {count}
          </CardTitle>
          <CardDescription className="text-xs">{countLabel}</CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {description}
        </CardContent>
      </Card>
    </Link>
  );
}

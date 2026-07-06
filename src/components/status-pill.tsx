import { cn } from "@/lib/utils";
import { STATUS_LABEL, type StageStatus } from "@/lib/types";

export function StatusPill({ status }: { status: StageStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        status === "completed" &&
          "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30",
        status === "waiting" &&
          "bg-amber-500/15 text-amber-500 border border-amber-500/30",
        status === "pending" &&
          "bg-muted text-muted-foreground border",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "completed" && "bg-emerald-500",
          status === "waiting" && "bg-amber-500",
          status === "pending" && "bg-muted-foreground/50",
        )}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

import { cn } from "@/lib/utils";
import {
  STAGE_LABEL,
  STAGE_ORDER,
  type StageKey,
  type StageState,
} from "@/lib/types";

export function StagePipeline({
  stages,
  size = "sm",
}: {
  stages: Record<StageKey, StageState>;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("flex items-center", size === "md" ? "gap-2" : "gap-1")}>
      {STAGE_ORDER.map((key, i) => {
        const state = stages[key];
        return (
          <div key={key} className="flex items-center gap-1 flex-1">
            <div
              className={cn(
                "flex-1 rounded-full",
                size === "md" ? "h-2" : "h-1.5",
                state.status === "completed" && "bg-emerald-500",
                state.status === "waiting" && "bg-amber-500",
                state.status === "pending" && "bg-muted",
              )}
              title={`${STAGE_LABEL[key]} — ${state.status}`}
            />
            {i < STAGE_ORDER.length - 1 ? (
              <div className="w-px h-3 bg-border/50" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

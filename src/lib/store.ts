import { createClient } from "@supabase/supabase-js";
import type {
  ChecklistKey,
  EmailLogEntry,
  Order,
  OrderNote,
  StageKey,
  StageStatus,
} from "./types";
import { STAGE_CHECKLIST_MAP, STAGE_ORDER } from "./types";
import { SEED_ORDERS } from "./seed";

const TABLE = "prototype_order_progression_state";
const ROW_ID = "main";

type State = { orders: Order[] };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

function seedState(): State {
  return { orders: SEED_ORDERS.map((o) => structuredClone(o)) };
}

async function readState(): Promise<State> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("state")
    .eq("id", ROW_ID)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const seed = seedState();
    await writeState(seed);
    return seed;
  }
  const state = data.state as Partial<State>;
  // Backfill any seed orders that were added after the row was first written,
  // so demos always see the full set even if the store was seeded earlier.
  const stored = state.orders ?? [];
  const byId = new Map(stored.map((o) => [o.id, o]));
  for (const s of SEED_ORDERS) {
    if (!byId.has(s.id)) stored.push(structuredClone(s));
  }
  return { orders: stored };
}

async function writeState(state: State): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id: ROW_ID, state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function listOrders(): Promise<Order[]> {
  const state = await readState();
  return [...state.orders].sort((a, b) =>
    b.orderNumber.localeCompare(a.orderNumber),
  );
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const state = await readState();
  return state.orders.find((o) => o.id === id);
}

export async function resetStore(): Promise<void> {
  await writeState(seedState());
}

export type StageUpdate = {
  status: StageStatus;
  note?: string;
  actor: string;
};

export async function updateStage(
  id: string,
  stage: StageKey,
  update: StageUpdate,
): Promise<Order | undefined> {
  const state = await readState();
  const idx = state.orders.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  const order = state.orders[idx];
  const now = new Date().toISOString();

  const nextStages = { ...order.stages };
  nextStages[stage] = {
    status: update.status,
    updatedAt: now,
    updatedBy: update.actor,
    note: update.note,
  };

  const nextChecklist = { ...order.checklist };
  let nextCurrent = order.currentStage;
  if (update.status === "completed") {
    for (const k of STAGE_CHECKLIST_MAP[stage] ?? []) {
      nextChecklist[k as ChecklistKey] = true;
    }
    const stageIdx = STAGE_ORDER.indexOf(stage);
    const currentIdx = STAGE_ORDER.indexOf(order.currentStage);
    if (stageIdx >= 0 && stageIdx < STAGE_ORDER.length - 1 && currentIdx <= stageIdx) {
      nextCurrent = STAGE_ORDER[stageIdx + 1];
    }
  } else if (update.status === "waiting" || update.status === "pending") {
    if (STAGE_ORDER.indexOf(order.currentStage) > STAGE_ORDER.indexOf(stage)) {
      nextCurrent = stage;
    }
  }

  const updated: Order = {
    ...order,
    stages: nextStages,
    checklist: nextChecklist,
    currentStage: nextCurrent,
  };
  const nextOrders = state.orders.slice();
  nextOrders[idx] = updated;
  await writeState({ orders: nextOrders });
  return updated;
}

export async function appendEmail(
  id: string,
  email: EmailLogEntry,
): Promise<void> {
  const state = await readState();
  const idx = state.orders.findIndex((o) => o.id === id);
  if (idx === -1) return;
  const nextOrders = state.orders.slice();
  nextOrders[idx] = {
    ...state.orders[idx],
    emails: [...state.orders[idx].emails, email],
  };
  await writeState({ orders: nextOrders });
}

export async function toggleChecklist(
  id: string,
  key: ChecklistKey,
  value: boolean,
): Promise<Order | undefined> {
  const state = await readState();
  const idx = state.orders.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  const updated: Order = {
    ...state.orders[idx],
    checklist: { ...state.orders[idx].checklist, [key]: value },
  };
  const nextOrders = state.orders.slice();
  nextOrders[idx] = updated;
  await writeState({ orders: nextOrders });
  return updated;
}

export async function addNote(
  id: string,
  note: OrderNote,
): Promise<Order | undefined> {
  const state = await readState();
  const idx = state.orders.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  const updated: Order = {
    ...state.orders[idx],
    notes: [...state.orders[idx].notes, note],
  };
  const nextOrders = state.orders.slice();
  nextOrders[idx] = updated;
  await writeState({ orders: nextOrders });
  return updated;
}

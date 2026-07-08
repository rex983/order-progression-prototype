import { createClient } from "@supabase/supabase-js";
import type {
  ChecklistKey,
  EmailLogEntry,
  EmailTemplate,
  EmailTemplateKey,
  Order,
  OrderNote,
  StageKey,
  StageStatus,
} from "./types";
import { ALL_TEMPLATE_KEYS, STAGE_CHECKLIST_MAP, STAGE_ORDER } from "./types";
import { SEED_ORDERS } from "./seed";
import { defaultTemplate, defaultTemplates } from "./emails";

const TABLE = "prototype_order_progression_state";
const TEMPLATES_TABLE = "prototype_email_templates";
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

// ───────────────────────────────────────────────────────────────────────────
// Email templates — single-row JSON blob keyed by template key.
// ───────────────────────────────────────────────────────────────────────────

type TemplatesState = { templates: Record<EmailTemplateKey, EmailTemplate> };

async function readTemplates(): Promise<TemplatesState> {
  const { data, error } = await supabase
    .from(TEMPLATES_TABLE)
    .select("state")
    .eq("id", ROW_ID)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const seed: TemplatesState = { templates: defaultTemplates() };
    await writeTemplates(seed);
    return seed;
  }
  const stored = ((data.state as Partial<TemplatesState>).templates ?? {}) as Partial<
    Record<EmailTemplateKey, EmailTemplate>
  >;
  // Backfill any missing keys with defaults so newly added stage/status combos
  // show up automatically without needing a manual reset.
  const merged = { ...defaultTemplates() };
  for (const k of ALL_TEMPLATE_KEYS) {
    const s = stored[k];
    if (s) merged[k] = { ...merged[k], ...s };
  }
  return { templates: merged };
}

async function writeTemplates(state: TemplatesState): Promise<void> {
  const { error } = await supabase
    .from(TEMPLATES_TABLE)
    .upsert({ id: ROW_ID, state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function listTemplates(): Promise<EmailTemplate[]> {
  const { templates } = await readTemplates();
  return ALL_TEMPLATE_KEYS.map((k) => templates[k]);
}

export async function getTemplate(
  key: EmailTemplateKey,
): Promise<EmailTemplate> {
  const { templates } = await readTemplates();
  return templates[key];
}

export type TemplateUpdate = Partial<
  Pick<EmailTemplate, "subject" | "body" | "toType" | "toCustom" | "cc" | "bcc" | "enabled">
> & { actor: string };

export async function updateTemplate(
  key: EmailTemplateKey,
  update: TemplateUpdate,
): Promise<EmailTemplate> {
  const { templates } = await readTemplates();
  const { actor, ...changes } = update;
  const next: EmailTemplate = {
    ...templates[key],
    ...changes,
    updatedAt: new Date().toISOString(),
    updatedBy: actor,
  };
  const nextTemplates = { ...templates, [key]: next };
  await writeTemplates({ templates: nextTemplates });
  return next;
}

export async function resetTemplate(
  key: EmailTemplateKey,
): Promise<EmailTemplate> {
  const { templates } = await readTemplates();
  const next = defaultTemplate(key);
  const nextTemplates = { ...templates, [key]: next };
  await writeTemplates({ templates: nextTemplates });
  return next;
}

export async function resetAllTemplates(): Promise<void> {
  await writeTemplates({ templates: defaultTemplates() });
}

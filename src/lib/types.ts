export type StageKey =
  | "welcome_call"
  | "land_prep_permitting"
  | "ready_for_install"
  | "scheduled";

export type StageStatus = "pending" | "waiting" | "completed";

export const STAGE_ORDER: StageKey[] = [
  "welcome_call",
  "land_prep_permitting",
  "ready_for_install",
  "scheduled",
];

export const STAGE_LABEL: Record<StageKey, string> = {
  welcome_call: "Welcome Call",
  land_prep_permitting: "Land Prep & Permitting",
  ready_for_install: "Ready for Install",
  scheduled: "Scheduled",
};

export const STAGE_DESCRIPTION: Record<StageKey, string> = {
  welcome_call:
    "BST introduces themselves to the customer and confirms contact info + delivery details.",
  land_prep_permitting:
    "Customer prepares their land and pulls any required permits. Pictures + permit approval unlock scheduling.",
  ready_for_install:
    "Order handed to the scheduling team. Manufacturer confirms build slot in customer's area.",
  scheduled:
    "Delivery + install date locked. Customer receives ETA. Job is confirmed on the manufacturer's route.",
};

export const STATUS_LABEL: Record<StageStatus, string> = {
  pending: "Pending",
  waiting: "In Progress",
  completed: "Completed",
};

// Which checklist items each stage completion should tick.
export const STAGE_CHECKLIST_MAP: Record<StageKey, ChecklistKey[]> = {
  welcome_call: ["welcome_call_made"],
  land_prep_permitting: ["permitting", "land_prep"],
  ready_for_install: ["scheduling"],
  scheduled: ["delivery_install"],
};

export type ChecklistKey =
  | "welcome_call_made"
  | "permitting"
  | "land_prep"
  | "scheduling"
  | "delivery_install";

export const CHECKLIST_LABEL: Record<ChecklistKey, string> = {
  welcome_call_made: "Welcome call made",
  permitting: "Step 1 · Permitting",
  land_prep: "Step 2 · Land prep",
  scheduling: "Step 3 · Scheduling",
  delivery_install: "Step 4 · Delivery & install",
};

export type Manufacturer =
  | "Safeguard"
  | "Best Choice"
  | "Eagle"
  | "TBS"
  | "American Steel"
  | "SBS";

export type StageState = {
  status: StageStatus;
  updatedAt?: string;
  updatedBy?: string;
  note?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  buildingSize: string;
  buildingType: string;
  address: string;
  city: string;
  state: string;
  salesRep: string;
  manufacturer: Manufacturer;
  stmDate: string;
  currentStage: StageKey;
  stages: Record<StageKey, StageState>;
  checklist: Record<ChecklistKey, boolean>;
  notes: OrderNote[];
  emails: EmailLogEntry[];
  scheduledEmails?: ScheduledEmail[];
  // Free-text so BST can capture whatever the manufacturer + county require
  // without a schema change. Used to branch template copy in {{#if ...}} blocks
  // and to route the right checklist link.
  permitType?: string;      // e.g. "Full building permit", "Zoning only", "None"
  foundationType?: string;  // e.g. "Concrete slab", "Piers", "Gravel pad", "Asphalt"
  landPrepStatus?: string;  // e.g. "Not started", "Cleared", "Graded", "Pad poured"
};

export type ScheduledEmailStatus = "pending" | "sent" | "canceled";

export type ScheduledEmail = {
  id: string;
  templateKey: EmailTemplateKey;
  triggeredBy: string;   // e.g. "welcome_call → completed (by Jordan Pace)"
  createdAt: string;
  sendAt: string;        // ISO timestamp — cron picks up when now >= sendAt
  status: ScheduledEmailStatus;
  sentAt?: string;
  sentEmailId?: string;
  canceledAt?: string;
  canceledBy?: string;
};

export type OrderNote = {
  id: string;
  author: string;
  createdAt: string;
  body: string;
};

export type EmailLogEntry = {
  id: string;
  sentAt: string;
  templateKey: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  triggeredBy: string;
};

export type EmailTemplateKey =
  | "welcome_call_pending"
  | "welcome_call_waiting"
  | "welcome_call_completed"
  | "land_prep_permitting_pending"
  | "land_prep_permitting_waiting"
  | "land_prep_permitting_completed"
  | "ready_for_install_pending"
  | "ready_for_install_waiting"
  | "ready_for_install_completed"
  | "scheduled_pending"
  | "scheduled_waiting"
  | "scheduled_completed";

export function emailTemplateKey(
  stage: StageKey,
  status: StageStatus,
): EmailTemplateKey {
  return `${stage}_${status}` as EmailTemplateKey;
}

export const ALL_TEMPLATE_KEYS: EmailTemplateKey[] = STAGE_ORDER.flatMap((s) =>
  (["pending", "waiting", "completed"] as StageStatus[]).map(
    (st) => emailTemplateKey(s, st),
  ),
);

// "to" recipient rules:
//   customer  → send to order.customerEmail
//   custom    → use toCustom field (supports comma-separated + {{tokens}})
export type EmailToType = "customer" | "custom";

// When the email should fire:
//   on_status_change   → immediately on the matching stage/status transition
//   delayed            → N days AFTER the matching transition (cron-picked)
//   manual             → never auto-fires; only via manual send
export type EmailTrigger = "on_status_change" | "delayed" | "manual";

export const TRIGGER_LABEL: Record<EmailTrigger, string> = {
  on_status_change: "Immediately on status change",
  delayed: "Delayed after status change",
  manual: "Manual only (never auto-fires)",
};

export type EmailTemplate = {
  key: EmailTemplateKey;
  subject: string;
  body: string;
  toType: EmailToType;
  toCustom: string;
  cc: string;
  bcc: string;
  enabled: boolean;
  trigger: EmailTrigger;
  delayDays: number;
  updatedAt?: string;
  updatedBy?: string;
};

// Tokens available inside subject/body/cc/bcc. Keep in sync with substitute().
export const EMAIL_TOKENS: { token: string; label: string }[] = [
  { token: "{{customerName}}", label: "Customer full name" },
  { token: "{{customerFirstName}}", label: "Customer first name" },
  { token: "{{customerEmail}}", label: "Customer email" },
  { token: "{{customerPhone}}", label: "Customer phone" },
  { token: "{{orderNumber}}", label: "Order number" },
  { token: "{{buildingSize}}", label: "Building size (e.g. 40x60x12)" },
  { token: "{{buildingType}}", label: "Building type" },
  { token: "{{city}}", label: "City" },
  { token: "{{state}}", label: "State" },
  { token: "{{address}}", label: "Address" },
  { token: "{{manufacturer}}", label: "Manufacturer" },
  { token: "{{salesRep}}", label: "Sales rep" },
  { token: "{{permitType}}", label: "Permit type" },
  { token: "{{foundationType}}", label: "Foundation type" },
  { token: "{{landPrepStatus}}", label: "Land prep status" },
];

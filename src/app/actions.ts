"use server";

import { revalidatePath } from "next/cache";
import { keyFor, renderTemplate } from "@/lib/emails";
import {
  addNote,
  appendEmail,
  cancelScheduledEmailInStore,
  enqueueScheduledEmail,
  getOrder,
  getTemplate,
  processDueScheduledEmails,
  resetAllTemplates,
  resetStore,
  resetTemplate,
  toggleChecklist,
  updateStage,
  updateTemplate,
} from "@/lib/store";
import type {
  ChecklistKey,
  EmailTemplateKey,
  EmailToType,
  EmailTrigger,
  StageKey,
  StageStatus,
} from "@/lib/types";

const BST_ACTOR = "Jordan Pace";

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function sendEmailImmediately(input: {
  orderId: string;
  templateKey: EmailTemplateKey;
  triggeredBy: string;
}) {
  const [order, template] = await Promise.all([
    getOrder(input.orderId),
    getTemplate(input.templateKey),
  ]);
  if (!order || !template) return null;
  const rendered = renderTemplate(template, order);
  const emailId = newId("eml");
  await appendEmail(input.orderId, {
    id: emailId,
    sentAt: new Date().toISOString(),
    templateKey: rendered.key,
    subject: rendered.subject,
    body: rendered.body,
    to: rendered.to,
    cc: rendered.cc || undefined,
    bcc: rendered.bcc || undefined,
    triggeredBy: input.triggeredBy,
  });
  return emailId;
}

export async function changeStageStatus(input: {
  orderId: string;
  stage: StageKey;
  status: StageStatus;
  note?: string;
  sendEmail: boolean;
}) {
  const before = await getOrder(input.orderId);
  if (!before) throw new Error("Order not found");
  const prev = before.stages[input.stage].status;

  await updateStage(input.orderId, input.stage, {
    status: input.status,
    note: input.note,
    actor: BST_ACTOR,
  });

  if (input.sendEmail && prev !== input.status) {
    const templateKey = keyFor(input.stage, input.status);
    const template = await getTemplate(templateKey);
    const triggeredBy = `${input.stage} → ${input.status} (by ${BST_ACTOR})`;

    if (template.enabled && template.trigger === "on_status_change") {
      await sendEmailImmediately({
        orderId: input.orderId,
        templateKey,
        triggeredBy,
      });
    } else if (template.enabled && template.trigger === "delayed") {
      const sendAt = new Date(
        Date.now() + Math.max(0, template.delayDays) * 24 * 60 * 60 * 1000,
      ).toISOString();
      await enqueueScheduledEmail(input.orderId, {
        id: newId("sch"),
        templateKey,
        triggeredBy,
        createdAt: new Date().toISOString(),
        sendAt,
        status: "pending",
      });
    }
    // trigger === "manual" or template disabled → nothing auto-fires.
  }

  revalidatePath("/", "layout");
  revalidatePath(`/orders/${input.orderId}`);
}

export async function toggleChecklistItem(input: {
  orderId: string;
  key: ChecklistKey;
  value: boolean;
}) {
  await toggleChecklist(input.orderId, input.key, input.value);
  revalidatePath(`/orders/${input.orderId}`);
  revalidatePath("/orders");
}

export async function addOrderNote(input: {
  orderId: string;
  body: string;
}) {
  if (!input.body.trim()) return;
  await addNote(input.orderId, {
    id: newId("not"),
    author: BST_ACTOR,
    createdAt: new Date().toISOString(),
    body: input.body.trim(),
  });
  revalidatePath(`/orders/${input.orderId}`);
}

export async function resetPrototype() {
  await resetStore();
  revalidatePath("/", "layout");
}

export async function saveEmailTemplate(input: {
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
}) {
  await updateTemplate(input.key, {
    subject: input.subject,
    body: input.body,
    toType: input.toType,
    toCustom: input.toCustom,
    cc: input.cc,
    bcc: input.bcc,
    enabled: input.enabled,
    trigger: input.trigger,
    delayDays: input.delayDays,
    actor: BST_ACTOR,
  });
  revalidatePath("/admin/emails");
  revalidatePath(`/admin/emails/${input.key}`);
}

export async function resetEmailTemplate(input: { key: EmailTemplateKey }) {
  await resetTemplate(input.key);
  revalidatePath("/admin/emails");
  revalidatePath(`/admin/emails/${input.key}`);
}

export async function resetAllEmailTemplates() {
  await resetAllTemplates();
  revalidatePath("/admin/emails");
}

export async function sendEmailNow(input: {
  orderId: string;
  templateKey: EmailTemplateKey;
}) {
  const emailId = await sendEmailImmediately({
    orderId: input.orderId,
    templateKey: input.templateKey,
    triggeredBy: `manual send by ${BST_ACTOR}`,
  });
  if (!emailId) throw new Error("Failed to send — order or template missing");
  revalidatePath(`/orders/${input.orderId}`);
  revalidatePath("/admin/emails");
  return emailId;
}

export async function cancelScheduledEmail(input: {
  orderId: string;
  scheduledId: string;
}) {
  await cancelScheduledEmailInStore(
    input.orderId,
    input.scheduledId,
    BST_ACTOR,
  );
  revalidatePath(`/orders/${input.orderId}`);
}

// Called by the Vercel cron. Also exposed as a manual admin action so you can
// force-process the queue without waiting for the cron.
export async function runScheduledEmailProcessor() {
  const result = await processDueScheduledEmails();
  revalidatePath("/", "layout");
  return result;
}

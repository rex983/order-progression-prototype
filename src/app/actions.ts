"use server";

import { revalidatePath } from "next/cache";
import { renderEmail } from "@/lib/emails";
import {
  addNote,
  appendEmail,
  getOrder,
  resetStore,
  toggleChecklist,
  updateStage,
} from "@/lib/store";
import type { ChecklistKey, StageKey, StageStatus } from "@/lib/types";

const BST_ACTOR = "Jordan Pace";

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
    const rendered = renderEmail(before, input.stage, input.status);
    await appendEmail(input.orderId, {
      id: `eml_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sentAt: new Date().toISOString(),
      templateKey: rendered.key,
      subject: rendered.subject,
      body: rendered.body,
      to: before.customerEmail,
      triggeredBy: `${input.stage} → ${input.status} (by ${BST_ACTOR})`,
    });
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
    id: `not_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
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

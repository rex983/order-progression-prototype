import type {
  EmailTemplate,
  EmailTemplateKey,
  Order,
  StageKey,
  StageStatus,
} from "./types";
import { ALL_TEMPLATE_KEYS, emailTemplateKey } from "./types";

// BBD email signature block shared across all default templates.
const SIGNATURE = `
______________________

BIG BUILDINGS DIRECT
Building Success Team
Text: 813-692-7320
Email: SuccessTeam@BigBuildingsDirect.com
777 S Harbour Island Blvd Suite 175
Tampa, FL 33602

Concrete Notch video: https://www.youtube.com/watch?v=qSt-Wb19H1o
Permitting video: https://www.youtube.com/watch?v=cId6NFpdJ2o
`.trim();

type DefaultTemplateBody = {
  subject: string;
  body: string;
  toType?: EmailTemplate["toType"];
  toCustom?: string;
  cc?: string;
  bcc?: string;
};

const DEFAULTS: Record<EmailTemplateKey, DefaultTemplateBody> = {
  welcome_call_pending: {
    subject: `Welcome to the family, {{customerFirstName}}!`,
    body: `Congratulations {{customerName}},

Thank you for taking the first step on your new building. You are now 1 step closer to having your custom designed building delivered and installed.

To track your order smoothly, please keep your order number in a safe place.

Order number — {{orderNumber}}

We understand and respect that your time is important. Whether your purchase decision took hours, days, or weeks, it was up to you to shop until you were ready. Our goal is for you to have the highest quality building at the most affordable price.

What you can expect next:
Within 24 hours you will receive an E-contract with all the contact and delivery information you have provided to us. Please make sure to comb through the E-contract and make sure that everything is accurate. After verifying, you will be required to sign the contract and initial in the appropriately marked spaces.

While this is happening, we will be drafting a deposit to secure your building as well. If there are any discrepancies on the payment we will be reaching out to you.

Once you've got your E-contract signed, it will be sent for review with our processing team and then sent to the manufacturer.

Thank you again,
${SIGNATURE}`,
  },

  welcome_call_waiting: {
    subject: `Trying to reach you about order {{orderNumber}}`,
    body: `Hi {{customerFirstName}},

We tried to reach you today for your welcome call but were unable to connect. Please give the Building Success Team a call back at 813-692-7320 or reply to this email to schedule a time that works for you.

Your order number is {{orderNumber}} — please keep it handy for reference.

${SIGNATURE}`,
  },

  welcome_call_completed: {
    subject: `{{customerFirstName}}, your next steps for order {{orderNumber}}`,
    body: `Congratulations {{customerName}},

Your next steps!

Your next steps can be found on step 1 and step 2 of your checklist: Permitting and Land Prep. If you are not pulling permits, proceed to land prep.

Permitting is the customer's responsibility.

Click here for your building checklist: https://bigbuildingsdirect.com/checklist
Click here for your next step guide: https://bigbuildingsdirect.com/next-steps

What you can expect next: Send Pictures!
Once your land is ready and your permits have been approved, the next step is to send your Building Success Team pictures of your land:

successteam@bigbuildingsdirect.com

This will start the process of getting your building on the schedule.

To track your order smoothly, please keep your order number ({{orderNumber}}) in a safe place.
${SIGNATURE}`,
  },

  land_prep_permitting_pending: {
    subject: `Order {{orderNumber}} — reminder on permits & land prep`,
    body: `Hi {{customerFirstName}},

Just a friendly check-in on your permit and land prep progress for order {{orderNumber}}. When your land is ready and your permits have been approved, send pictures to successteam@bigbuildingsdirect.com and we'll get you moved to scheduling.

If you have any questions, don't hesitate to reach out.
${SIGNATURE}`,
  },

  land_prep_permitting_waiting: {
    subject: `Following up on your permits — order {{orderNumber}}`,
    body: `Hi {{customerFirstName}},

We're following up on the permits and land prep for order {{orderNumber}}. Let us know how things are coming along and if there is anything we can help you with. Once your permits are approved and your land is ready, send us pictures and we'll get you on the schedule.

${SIGNATURE}`,
  },

  land_prep_permitting_completed: {
    subject: `Nice work, {{customerFirstName}} — you're ready for install!`,
    body: `Congratulations on completing your permits and land prep!

You are now ready for the most exciting step of the journey!

Your next steps!
Your next steps can be found on step 3 and step 4 of your checklist: Scheduling and Delivery & Install.

Any delivery time given by your scheduler is an estimate based on weather conditions and volume of orders received in your area.

Click here for your building checklist: https://bigbuildingsdirect.com/checklist
Click here for your next step guide: https://bigbuildingsdirect.com/next-steps

Final Step: Send Pictures!
Once your building is up and on your property, please take a few pictures and send them to us. We love to see the finished project and it allows us to confirm a successful delivery and installation.

To track your order smoothly, please keep your order number ({{orderNumber}}) in a safe place.
${SIGNATURE}`,
  },

  ready_for_install_pending: {
    subject: `Order {{orderNumber}} — getting you on the schedule`,
    body: `Hi {{customerFirstName}},

Great news — your order is now with our scheduling team. We're coordinating with {{manufacturer}} to lock in a delivery + install date for your {{buildingSize}} in {{city}}, {{state}}.

You'll hear from us shortly with a confirmed window. In the meantime, if anything changes on your end (site access, gate codes, etc.) reply to this email so we can update the file.

${SIGNATURE}`,
  },

  ready_for_install_waiting: {
    subject: `Scheduling update on order {{orderNumber}}`,
    body: `Hi {{customerFirstName}},

Quick update on scheduling for order {{orderNumber}}: we're still working with {{manufacturer}} on a firm date for your area. As soon as we have a confirmed window we'll reach out with the ETA.

Thanks for your patience!
${SIGNATURE}`,
  },

  ready_for_install_completed: {
    subject: `Order {{orderNumber}} is on the schedule!`,
    body: `Hi {{customerFirstName}},

Your {{buildingSize}} {{buildingType}} is officially on the {{manufacturer}} schedule. The install crew will confirm the exact date directly with you.

A few reminders before delivery day:
  • Keep your site accessible and clear of obstacles.
  • Have someone 18+ available on site to sign for the delivery.
  • Any delivery time is an estimate based on weather + route volume.

To track your order smoothly, please keep your order number ({{orderNumber}}) in a safe place.
${SIGNATURE}`,
  },

  scheduled_pending: {
    subject: `Delivery window confirmed for order {{orderNumber}}`,
    body: `Hi {{customerFirstName}},

Your delivery + install window has been confirmed! Here's what happens next:

  • The install crew will call you 24–48 hours ahead to confirm arrival.
  • Please make sure the site is clear and someone 18+ is on site.
  • Weather may push the ETA — we'll keep you posted.

Order number: {{orderNumber}}
Manufacturer: {{manufacturer}}
${SIGNATURE}`,
  },

  scheduled_waiting: {
    subject: `Delivery update — order {{orderNumber}}`,
    body: `Hi {{customerFirstName}},

We need to touch base on the delivery for order {{orderNumber}}. A member of the Building Success Team will reach out shortly — or feel free to call us at 813-692-7320.

${SIGNATURE}`,
  },

  scheduled_completed: {
    subject: `Enjoy your new building, {{customerFirstName}}!`,
    body: `Hi {{customerFirstName}},

Congratulations — your {{buildingSize}} {{buildingType}} has been delivered and installed! We hope it serves you well for years to come.

One last favor: please send us a few pictures of the finished build to successteam@bigbuildingsdirect.com. We love seeing the finished project and it helps us confirm a successful delivery.

Thank you for choosing Big Buildings Direct.
${SIGNATURE}`,
  },
};

export function defaultTemplate(key: EmailTemplateKey): EmailTemplate {
  const d = DEFAULTS[key];
  return {
    key,
    subject: d.subject,
    body: d.body,
    toType: d.toType ?? "customer",
    toCustom: d.toCustom ?? "",
    cc: d.cc ?? "",
    bcc: d.bcc ?? "",
    enabled: true,
  };
}

export function defaultTemplates(): Record<EmailTemplateKey, EmailTemplate> {
  const out = {} as Record<EmailTemplateKey, EmailTemplate>;
  for (const k of ALL_TEMPLATE_KEYS) out[k] = defaultTemplate(k);
  return out;
}

export function tokenValues(order: Order): Record<string, string> {
  const first = order.customerName.split(" ")[0] ?? order.customerName;
  return {
    customerName: order.customerName,
    customerFirstName: first,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    orderNumber: order.orderNumber,
    buildingSize: order.buildingSize,
    buildingType: order.buildingType,
    city: order.city,
    state: order.state,
    address: order.address,
    manufacturer: order.manufacturer,
    salesRep: order.salesRep,
  };
}

export function substitute(input: string, values: Record<string, string>): string {
  return input.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k) => values[k] ?? "");
}

export type RenderedEmail = {
  key: EmailTemplateKey;
  subject: string;
  body: string;
  to: string;
  cc: string;
  bcc: string;
  enabled: boolean;
};

export function renderTemplate(
  template: EmailTemplate,
  order: Order,
): RenderedEmail {
  const values = tokenValues(order);
  const to =
    template.toType === "custom"
      ? substitute(template.toCustom, values)
      : order.customerEmail;
  return {
    key: template.key,
    subject: substitute(template.subject, values),
    body: substitute(template.body, values),
    to,
    cc: substitute(template.cc, values),
    bcc: substitute(template.bcc, values),
    enabled: template.enabled,
  };
}

export function keyFor(stage: StageKey, status: StageStatus): EmailTemplateKey {
  return emailTemplateKey(stage, status);
}

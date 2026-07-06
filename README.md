# BBD Order Progression Prototype

Post-STM order progression workflow for Big Buildings Direct's Building Success Team. Prototype intended to be folded into the existing order processing app.

Deployed: TBD (`order-progression-prototype.vercel.app`)

## What it does

Once an order has been sent to the manufacturer (STM status), BST walks it through four stages:

1. **Welcome Call** — BST introduces themselves + confirms details.
2. **Land Prep & Permitting** — customer pulls permits and preps their land.
3. **Ready for Install** — scheduling team locks in the manufacturer's build slot.
4. **Scheduled** — delivery + install date confirmed.

Each stage carries a status of **Pending**, **Waiting on Customer**, or **Completed**. Every status change fires a templated customer email and ticks the linked checklist item. Completing a stage advances the order to the next one automatically.

## Stack

- Next.js 16 (Turbopack) + Tailwind v4 + shadcn/ui
- Supabase (`xockuiyvxijuzlwlsfbu`, table `prototype_order_progression_state`) — single-row JSON blob so state survives serverless invocations.
- No auth. Public prototype for demo purposes only.

## Local development

```bash
cp .env.local.example .env.local   # fill in Supabase creds
npm install
npm run dev
```

App at http://localhost:3000.

## Supabase setup

Apply `supabase/schema.sql` in the Supabase SQL editor for project `xockuiyvxijuzlwlsfbu`. The store auto-seeds on first read if the row is missing.

## Integration hooks

To fold this into the real order processing app, replace `src/lib/store.ts` with an adapter over the production DB (same interface: `listOrders / getOrder / updateStage / appendEmail / toggleChecklist / addNote`) and swap `appendEmail` for the real transactional email sender.

- **Stage-transition emails** — templates in `src/lib/emails.ts`, keyed `<stage>_<status>` (12 total). Substitution vars: `customerName`, `orderNumber`, `buildingSize`, `buildingType`, `city`, `state`, `manufacturer`.
- **Checklist** — `STAGE_CHECKLIST_MAP` in `src/lib/types.ts` maps each stage → the checklist keys it auto-ticks on completion.
- **Actor** — hard-coded `Jordan Pace` (BST) in `src/app/actions.ts`. Replace with the real signed-in user once auth is wired.

## Reset

Hit `/admin` to wipe demo state back to seed.

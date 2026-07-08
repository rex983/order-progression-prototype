-- Run in Supabase SQL editor for project xockuiyvxijuzlwlsfbu.
-- Single-row JSON blob store for the order progression prototype.
-- Wide-open: prototype only, accessed via service role from server actions.

create table if not exists public.prototype_order_progression_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS off intentionally; only the server (service role) talks to this table.
alter table public.prototype_order_progression_state disable row level security;

-- Editable email templates. Single-row JSON blob keyed by template key.
create table if not exists public.prototype_email_templates (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.prototype_email_templates disable row level security;

create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  type text not null check (type in ('text_to_model', 'image_to_model')),
  prompt text,
  provider text not null default 'tripo' check (provider in ('tripo', 'replicate')),
  provider_task_id text not null unique,
  status text not null default 'queued',
  model_url text,
  rendered_image_url text,
  created_at timestamptz not null default now()
);

create index if not exists generations_user_id_idx on generations (user_id, created_at desc);

alter table generations enable row level security;

-- All reads/writes go through the server (Clerk auth + service role key),
-- so no client-facing policies are defined here.

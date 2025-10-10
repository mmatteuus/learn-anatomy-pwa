-- JGAnatomia initial schema + policies + seeds
-- Generated at 2025-10-09

-- Extensions -----------------------------------------------------------------
create extension if not exists pgcrypto with schema public;
create extension if not exists "uuid-ossp" with schema public;

-- Tables ---------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default auth.uid(),
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  idx int not null,
  title text not null,
  is_demo boolean default false,
  created_at timestamptz default now(),
  unique (module_id, idx)
);

create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  owner uuid references public.users(id) on delete set null,
  kind text check (kind in ('url','pdf','image')),
  url text,
  storage_path text,
  title text,
  notes text,
  visibility text default 'private' check (visibility in ('private','class','public')),
  created_at timestamptz default now()
);

create table if not exists public.quiz_items (
  id uuid primary key default gen_random_uuid(),
  level_id uuid references public.levels(id) on delete cascade,
  type text check (type in ('mcq','hotspot','label')),
  stem text not null,
  options jsonb,
  answer jsonb,
  explanation text,
  tags text[],
  difficulty int default 1
);

create unique index if not exists quiz_items_level_stem_idx
  on public.quiz_items (level_id, stem);

create table if not exists public.user_progress (
  user_id uuid references public.users(id) on delete cascade,
  level_id uuid references public.levels(id) on delete cascade,
  best_score int default 0,
  last_played timestamptz default now(),
  completed boolean default false,
  primary key (user_id, level_id)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  quiz_item_id uuid references public.quiz_items(id) on delete cascade,
  correct boolean,
  time_ms int,
  confidence int,
  created_at timestamptz default now()
);

-- Row Level Security ---------------------------------------------------------
alter table public.users enable row level security;
alter table public.user_progress enable row level security;
alter table public.attempts enable row level security;
alter table public.content_sources enable row level security;

-- Policies: Users ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'users self read'
  ) then
    create policy "users self read"
      on public.users
      for select
      using (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'users self insert'
  ) then
    create policy "users self insert"
      on public.users
      for insert
      with check (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'users self update'
  ) then
    create policy "users self update"
      on public.users
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

-- Policies: User Progress ----------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_progress'
      and policyname = 'progress owner'
  ) then
    create policy "progress owner"
      on public.user_progress
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Policies: Attempts ---------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'attempts'
      and policyname = 'attempts owner'
  ) then
    create policy "attempts owner"
      on public.attempts
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Policies: Content Sources --------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'content_sources'
      and policyname = 'content public read'
  ) then
    create policy "content public read"
      on public.content_sources
      for select
      using (
        visibility = 'public'
        or auth.uid() = owner
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'content_sources'
      and policyname = 'content owner write'
  ) then
    create policy "content owner write"
      on public.content_sources
      for all
      using (auth.uid() = owner)
      with check (auth.uid() = owner);
  end if;
end $$;

-- Storage buckets ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('study-docs', 'study-docs', false)
on conflict (id) do update set public = excluded.public;

-- Storage policies -----------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'public read public-assets'
  ) then
    create policy "public read public-assets"
      on storage.objects
      for select
      using (bucket_id = 'public-assets');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'owner write study-docs'
  ) then
    create policy "owner write study-docs"
      on storage.objects
      for all
      using (
        bucket_id = 'study-docs'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
      with check (
        bucket_id = 'study-docs'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'owner write public-assets'
  ) then
    create policy "owner write public-assets"
      on storage.objects
      for all
      using (
        bucket_id = 'public-assets'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
      with check (
        bucket_id = 'public-assets'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

-- Seed data ------------------------------------------------------------------
insert into public.modules (slug, title, description)
values
  ('osteologia', 'Osteologia', 'Ossos e marcos anatomicos'),
  ('muscular', 'Sistema Muscular', 'Musculos: origem, insercao e inervacao')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description;

with osteologia as (
  select id from public.modules where slug = 'osteologia' limit 1
)
insert into public.levels (module_id, idx, title, is_demo)
select osteologia.id, data.idx, data.title, data.is_demo
from osteologia
cross join (values
  (1, 'Level 1 (Demo)', true),
  (2, 'Level 2', false),
  (3, 'Level 3', false)
) as data (idx, title, is_demo)
on conflict (module_id, idx) do update set
  title = excluded.title,
  is_demo = excluded.is_demo;

with demo_level as (
  select l.id
  from public.levels l
  join public.modules m on m.id = l.module_id
  where m.slug = 'osteologia' and l.idx = 1
  limit 1
)
insert into public.quiz_items (level_id, type, stem, options, answer, explanation, tags, difficulty)
select demo_level.id,
  'mcq',
  'Qual osso forma a parte frontal do cranio?',
  '[{"key":"A","text":"Frontal"},{"key":"B","text":"Temporal"},{"key":"C","text":"Occipital"},{"key":"D","text":"Parietal"}]'::jsonb,
  '"A"'::jsonb,
  'O osso frontal forma a testa e o teto das orbitas.',
  array['cranio','osteologia','ossos'],
  1
from demo_level
on conflict (level_id, stem) do update set
  type = excluded.type,
  options = excluded.options,
  answer = excluded.answer,
  explanation = excluded.explanation,
  tags = excluded.tags,
  difficulty = excluded.difficulty;

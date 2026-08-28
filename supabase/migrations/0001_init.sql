-- =============================================================================
-- Débora Freitas Ateliê — schema inicial
-- Tudo escopado por org_id. RLS ligada em todas as tabelas de domínio.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------- enums -----------------------------------------------------------
create type user_role      as enum ('owner', 'editor', 'assistant', 'viewer');
create type project_kind   as enum ('social', 'client_presentation', 'lookbook', 'making_of');
create type project_status as enum ('draft', 'in_review', 'approved', 'exported');
create type media_kind     as enum ('video', 'image', 'audio');
create type render_status  as enum ('queued', 'processing', 'done', 'error');
create type render_engine  as enum ('ffmpeg_wasm', 'webcodecs', 'server');
create type review_decision as enum ('approved', 'changes_requested');

-- ---------- organizações & perfis ----------------------------------------
create table organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  brand_kit_id  uuid,
  created_at    timestamptz not null default now()
);

create table profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  org_id           uuid not null references organizations (id) on delete cascade,
  full_name        text not null default '',
  role             user_role not null default 'assistant',
  onboarding_state jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);
create index profiles_org_idx on profiles (org_id);

-- helper: orgs às quais o usuário atual pertence
create or replace function auth_org_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select org_id from profiles where id = auth.uid()
$$;

create or replace function auth_has_role(required user_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = any (required)
  )
$$;

-- ---------- brand kits ---------------------------------------------------
create table brand_kits (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations (id) on delete cascade,
  logo_light_path text,
  logo_dark_path  text,
  palette         jsonb not null default '{"ink":"#0A0A0A","paper":"#FAFAF8"}'::jsonb,
  fonts           jsonb not null default '{"display":"Cormorant Garamond","sans":"Inter"}'::jsonb,
  intro_template  jsonb,
  outro_template  jsonb,
  created_at      timestamptz not null default now()
);
alter table organizations
  add constraint organizations_brand_kit_fk
  foreign key (brand_kit_id) references brand_kits (id) on delete set null;

-- ---------- clientes & coleções ----------------------------------------
create table clients (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations (id) on delete cascade,
  name       text not null,
  contact    jsonb not null default '{}'::jsonb,
  notes      text,
  created_at timestamptz not null default now()
);
create index clients_org_idx on clients (org_id);

create table collections (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations (id) on delete cascade,
  name        text not null,
  season      text,
  year        int,
  description text,
  cover_path  text,
  created_at  timestamptz not null default now()
);
create index collections_org_idx on collections (org_id);

-- ---------- projetos ---------------------------------------------------
create table projects (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references organizations (id) on delete cascade,
  title            text not null default 'Sem título',
  kind             project_kind not null,
  client_id        uuid references clients (id) on delete set null,
  collection_id    uuid references collections (id) on delete set null,
  status           project_status not null default 'draft',
  aspect_ratio     text not null default '9:16',
  resolution       text not null default '1080p',
  timeline         jsonb not null default '{}'::jsonb,
  timeline_version int  not null default 1,
  wizard_answers   jsonb not null default '{}'::jsonb,
  duration_ms      int  not null default 0,
  thumbnail_path   text,
  created_by       uuid references auth.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index projects_org_idx on projects (org_id);
create index projects_client_idx on projects (client_id);
create index projects_collection_idx on projects (collection_id);

-- ---------- mídia ----------------------------------------------------
create table media_assets (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations (id) on delete cascade,
  project_id    uuid references projects (id) on delete cascade,
  kind          media_kind not null,
  scene_tag     text,          -- agrupa takes da mesma cena (sugerido, editável)
  take_number   int,
  storage_path  text not null,
  poster_path   text,
  width         int,
  height        int,
  duration_ms   int,
  size_bytes    bigint,
  checksum      text,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);
create index media_org_idx on media_assets (org_id);
create index media_project_idx on media_assets (project_id);
create index media_scene_idx on media_assets (project_id, scene_tag);

-- ---------- templates -------------------------------------------------
create table templates (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references organizations (id) on delete cascade, -- null = embutido
  name        text not null,
  kind        text not null,
  preview_path text,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index templates_org_idx on templates (org_id);

-- ---------- renders -------------------------------------------------
create table renders (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects (id) on delete cascade,
  requested_by uuid references auth.users (id) on delete set null,
  status      render_status not null default 'queued',
  progress    numeric not null default 0,
  output_path text,
  engine      render_engine not null default 'ffmpeg_wasm',
  error_text  text,
  started_at  timestamptz,
  finished_at timestamptz,
  created_at  timestamptz not null default now()
);
create index renders_project_idx on renders (project_id);

-- ---------- revisão pelo cliente ----------------------------------
create table review_links (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects (id) on delete cascade,
  token         text not null unique default encode(gen_random_bytes(18), 'hex'),
  expires_at    timestamptz,
  allow_comments boolean not null default true,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create table comments (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references projects (id) on delete cascade,
  review_link_id uuid references review_links (id) on delete set null,
  author_name    text not null,
  body           text not null,
  timecode_ms    int,
  resolved       boolean not null default false,
  created_at     timestamptz not null default now()
);
create index comments_project_idx on comments (project_id);

create table approvals (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects (id) on delete cascade,
  review_link_id  uuid references review_links (id) on delete set null,
  decision        review_decision not null,
  note            text,
  decided_by_name text not null,
  created_at      timestamptz not null default now()
);
create index approvals_project_idx on approvals (project_id);

-- ---------- auditoria ------------------------------------------------
create table activity_log (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations (id) on delete cascade,
  actor      uuid references auth.users (id) on delete set null,
  entity     text not null,
  entity_id  uuid,
  action     text not null,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_org_idx on activity_log (org_id, created_at desc);

-- ---------- updated_at trigger -------------------------------------
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger projects_touch before update on projects
  for each row execute function touch_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================
alter table organizations enable row level security;
alter table profiles      enable row level security;
alter table brand_kits    enable row level security;
alter table clients       enable row level security;
alter table collections   enable row level security;
alter table projects      enable row level security;
alter table media_assets  enable row level security;
alter table templates     enable row level security;
alter table renders       enable row level security;
alter table review_links  enable row level security;
alter table comments      enable row level security;
alter table approvals     enable row level security;
alter table activity_log  enable row level security;

-- perfis: cada um lê a própria org; edita o próprio registro
create policy profiles_read on profiles for select
  using (org_id in (select auth_org_ids()));
create policy profiles_self_update on profiles for update
  using (id = auth.uid());

create policy orgs_read on organizations for select
  using (id in (select auth_org_ids()));

-- macro simples: uma policy "membro da org" por tabela escopada
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'brand_kits','clients','collections','projects','media_assets',
    'templates','renders','review_links','comments','approvals'
  ] loop
    execute format($f$
      create policy %1$s_org_all on %1$s for all
        using (
          org_id in (select auth_org_ids())
          or exists (select 1 from projects p
                     where p.id = %1$s.project_id
                       and p.org_id in (select auth_org_ids()))
        )
        with check (
          org_id in (select auth_org_ids())
          or exists (select 1 from projects p
                     where p.id = %1$s.project_id
                       and p.org_id in (select auth_org_ids()))
        );
    $f$, tbl);
  end loop;
end $$;

-- templates embutidos (org_id null) são visíveis para todos os autenticados
create policy templates_builtin_read on templates for select
  using (org_id is null);

create policy activity_read on activity_log for select
  using (org_id in (select auth_org_ids()));
create policy activity_insert on activity_log for insert
  with check (org_id in (select auth_org_ids()));

-- Comentários/aprovações vindos de link público entram pela Edge Function
-- `review-access` com service role (que ignora RLS). Sem policy de insert
-- anônimo aqui, de propósito.

-- =============================================================================
-- Storage buckets (todos privados; acesso por URL assinada)
-- =============================================================================
insert into storage.buckets (id, name, public) values
  ('media', 'media', false),
  ('thumbnails', 'thumbnails', false),
  ('renders', 'renders', false),
  ('brand', 'brand', false)
on conflict (id) do nothing;

create policy "org lê seus arquivos"
  on storage.objects for select to authenticated
  using (
    bucket_id in ('media','thumbnails','renders','brand')
    and (storage.foldername(name))[1] in (select auth_org_ids()::text)
  );

create policy "org grava seus arquivos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('media','thumbnails','renders','brand')
    and (storage.foldername(name))[1] in (select auth_org_ids()::text)
  );

create policy "org apaga seus arquivos"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('media','thumbnails','renders','brand')
    and (storage.foldername(name))[1] in (select auth_org_ids()::text)
  );

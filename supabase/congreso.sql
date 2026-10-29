-- Esquema dinamico para Congreso Nacional de Aseguradoras y Hospitales.
-- Ejecutar en el SQL Editor de Supabase.
-- Instalaciones anteriores: ejecutar edition-amenities.sql antes de este archivo.
-- Configuracion global de contacto: ejecutar tambien social-settings.sql.

create extension if not exists "uuid-ossp";

create table if not exists public.app_errors (
  id uuid primary key default uuid_generate_v4(),
  context text not null,
  message text not null,
  stack text,
  path text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists app_errors_created_at_idx
  on public.app_errors (created_at desc);

-- Ediciones: permite separar Monterrey 2026, Merida 2025 y Guadalajara 2027.
create table if not exists public.congress_editions (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  year integer not null check (year between 2000 and 2100),
  city text not null,
  venue_name text,
  starts_on date,
  ends_on date,
  status text not null default 'archived' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists congress_editions_one_published_idx
  on public.congress_editions (status)
  where status = 'published';

create or replace function public.prevent_published_edition_downgrade()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'published'
    and new.status is distinct from old.status
    and new.status <> 'archived' then
    raise exception 'Una edicion publicada solo puede cambiar a archived';
  end if;
  return new;
end;
$$;

drop trigger if exists congress_editions_status_transition on public.congress_editions;
create trigger congress_editions_status_transition
before update of status on public.congress_editions
for each row execute function public.prevent_published_edition_downgrade();

-- Niveles que usa la seccion de patrocinio y el formulario.
create table if not exists public.sponsorship_tiers (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique check (code in ('diamante', 'oro', 'plata', 'branding')),
  label text not null,
  display_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.sponsors (
  id uuid primary key default uuid_generate_v4(),
  edition_id uuid not null references public.congress_editions(id) on delete cascade,
  tier_id uuid not null references public.sponsorship_tiers(id),
  name varchar(255) not null,
  logo_url text not null,
  website_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- Paneles y personas. is_moderator permite representar moderator y panelists.
create table if not exists public.panels (
  id uuid primary key default uuid_generate_v4(),
  edition_id uuid not null references public.congress_editions(id) on delete cascade,
  track varchar(150) not null,
  title varchar(255) not null,
  description text,
  location varchar(150),
  start_time timestamptz,
  end_time timestamptz,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.panel_speakers (
  id uuid primary key default uuid_generate_v4(),
  panel_id uuid not null references public.panels(id) on delete cascade,
  name varchar(255) not null,
  role varchar(255),
  avatar_url text,
  bio text,
  is_moderator boolean not null default false,
  display_order integer not null default 0
);

-- Sede principal por edicion.
create table if not exists public.venues (
  id uuid primary key default uuid_generate_v4(),
  edition_id uuid not null references public.congress_editions(id) on delete cascade,
  name varchar(255) not null,
  address text not null,
  description text,
  image_url text,
  google_maps_url text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  is_active boolean not null default true,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.venue_amenities (
  id uuid primary key default uuid_generate_v4(),
  edition_id uuid not null references public.congress_editions(id) on delete cascade,
  label varchar(255) not null,
  display_order integer not null default 0
);

-- Compatibilidad con instalaciones existentes y archivo de eventos.
alter table public.venues
  add column if not exists video_url text,
  add column if not exists video_label text;
alter table public.venue_amenities
  add column if not exists image_url text,
  add column if not exists alt_text text;

create index if not exists venue_amenities_edition_order_idx
  on public.venue_amenities (edition_id, display_order);

-- Incluye videos del archivo, fotos y medios aliados.
create table if not exists public.media_items (
  id uuid primary key default uuid_generate_v4(),
  edition_id uuid references public.congress_editions(id) on delete cascade,
  title varchar(255),
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  url text not null,
  thumbnail_url text,
  alt_text text,
  category text not null default 'general' check (category in ('archive', 'media_partner', 'gallery', 'general')),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- Replica todos los campos que el ContactForm recoge antes de enviarlos.
create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  full_name varchar(255) not null,
  role varchar(255),
  company varchar(255) not null,
  organization varchar(150),
  email varchar(255) not null,
  interest text check (interest in ('asistencia', 'patrocinar') or interest is null),
  sponsorship_tier_id uuid references public.sponsorship_tiers(id),
  message text,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  internal_notes text,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists sponsors_edition_order_idx
  on public.sponsors (edition_id, display_order)
  where is_active = true;
create index if not exists panels_edition_order_idx
  on public.panels (edition_id, display_order)
  where is_published = true;
create index if not exists panel_speakers_panel_order_idx
  on public.panel_speakers (panel_id, is_moderator desc, display_order);
create index if not exists venues_edition_active_idx
  on public.venues (edition_id)
  where is_active = true;
create index if not exists media_items_edition_order_idx
  on public.media_items (edition_id, category, display_order)
  where is_active = true;
create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

-- Datos base que corresponden a las pestanas y niveles actuales de la landing.
insert into public.sponsorship_tiers (code, label, display_order)
values
  ('diamante', 'Patrocinador Diamante', 1),
  ('oro', 'Patrocinador Oro', 2),
  ('plata', 'Patrocinador Plata', 3),
  ('branding', 'Branding', 4)
on conflict (code) do update set label = excluded.label, display_order = excluded.display_order;

insert into public.congress_editions (slug, year, city, starts_on, ends_on, status)
values
  ('mer-2025', 2025, 'Merida', '2025-01-01', '2025-12-31', 'archived'),
  ('mty-2026', 2026, 'Monterrey', '2026-01-01', '2026-12-31', 'archived'),
  ('prox-2027', 2027, 'Guadalajara', '2027-09-01', '2027-09-04', 'published')
on conflict (slug) do update set city = excluded.city, starts_on = excluded.starts_on, ends_on = excluded.ends_on;

-- RLS: la landing solo puede leer contenido publicado/activo y crear mensajes.
alter table public.congress_editions enable row level security;
alter table public.sponsorship_tiers enable row level security;
alter table public.sponsors enable row level security;
alter table public.panels enable row level security;
alter table public.panel_speakers enable row level security;
alter table public.venues enable row level security;
alter table public.venue_amenities enable row level security;
alter table public.media_items enable row level security;
alter table public.contact_messages enable row level security;
alter table public.app_errors enable row level security;

drop policy if exists "Public can read published editions" on public.congress_editions;
create policy "Public can read published editions" on public.congress_editions
  for select using (status in ('published', 'archived', 'draft'));

do $$
begin
  create policy "Public can read active tiers" on public.sponsorship_tiers
    for select using (is_active = true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Public can read active sponsors" on public.sponsors
    for select using (is_active = true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Public can read published panels" on public.panels
    for select using (is_published = true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Public can read panel speakers" on public.panel_speakers
    for select using (exists (
      select 1 from public.panels p
      where p.id = panel_id and p.is_published = true
    ));
exception when duplicate_object then null;
end $$;

drop policy if exists "Public can read active venues" on public.venues;
create policy "Public can read active venues" on public.venues
  for select using (
    is_active = true
    and exists (
      select 1 from public.congress_editions e
      where e.id = edition_id and e.status in ('published', 'archived')
    )
  );

do $$
begin
  create policy "Public can read venue amenities" on public.venue_amenities
    for select using (exists (
      select 1 from public.congress_editions e
      where e.id = edition_id and e.status in ('published', 'archived')
    ));
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Public can read active media" on public.media_items
    for select using (is_active = true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Public can insert contact messages" on public.contact_messages
    for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Public can insert application errors" on public.app_errors
    for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated users read application errors" on public.app_errors
    for select to authenticated using (true);
exception when duplicate_object then null;
end $$;

-- El panel administrativo usa una sesion Supabase autenticada.
-- En produccion conviene restringir estas politicas a un rol admin propio.
do $$
begin
  create policy "Authenticated users manage editions" on public.congress_editions
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated users manage tiers" on public.sponsorship_tiers
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated users manage sponsors" on public.sponsors
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated users manage panels" on public.panels
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated users manage panel speakers" on public.panel_speakers
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated users manage venues" on public.venues
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated users manage venue amenities" on public.venue_amenities
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated users manage media" on public.media_items
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated users manage contact messages" on public.contact_messages
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

-- Ejecutar una vez en Supabase SQL Editor para corregir errores 42501 del panel.
-- Requiere que el usuario haya iniciado sesion con Supabase Auth.

alter table if exists public.congress_editions enable row level security;

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
alter table if exists public.sponsorship_tiers enable row level security;
alter table if exists public.sponsors enable row level security;
alter table if exists public.panels enable row level security;
alter table if exists public.panel_speakers enable row level security;
alter table if exists public.venues enable row level security;
alter table if exists public.venue_amenities enable row level security;
alter table if exists public.media_items enable row level security;
alter table if exists public.contact_messages enable row level security;
alter table if exists public.app_errors enable row level security;

do $$
begin
  create policy "Public insert application errors" on public.app_errors
    for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin read application errors" on public.app_errors
    for select to authenticated using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin authenticated editions" on public.congress_editions
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin authenticated tiers" on public.sponsorship_tiers
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin authenticated sponsors" on public.sponsors
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin authenticated panels" on public.panels
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin authenticated panel speakers" on public.panel_speakers
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin authenticated venues" on public.venues
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin authenticated venue amenities" on public.venue_amenities
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin authenticated media" on public.media_items
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin authenticated contact messages" on public.contact_messages
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

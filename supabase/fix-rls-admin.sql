-- Ejecutar una vez en Supabase SQL Editor para corregir errores 42501 del panel.
-- Requiere que el usuario haya iniciado sesion con Supabase Auth.

alter table if exists public.congress_editions enable row level security;
alter table if exists public.sponsorship_tiers enable row level security;
alter table if exists public.sponsors enable row level security;
alter table if exists public.panels enable row level security;
alter table if exists public.panel_speakers enable row level security;
alter table if exists public.venues enable row level security;
alter table if exists public.venue_amenities enable row level security;
alter table if exists public.media_items enable row level security;
alter table if exists public.contact_messages enable row level security;

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

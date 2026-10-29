-- Configuracion global de multiples enlaces sociales, sin relacion con una edicion.
begin;

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  network text not null check (network in ('whatsapp', 'telegram', 'facebook', 'linkedin')),
  url text not null check (url ~ '^https://'),
  label text not null check (length(btrim(label)) > 0),
  is_active boolean not null default false,
  open_in_new_tab boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  legacy_id text unique
);

alter table public.social_links
  drop constraint if exists social_links_network_check;
alter table public.social_links
  add constraint social_links_network_check
  check (network in ('whatsapp', 'telegram', 'facebook', 'linkedin'));

create index if not exists social_links_active_order_idx
  on public.social_links (display_order, id)
  where is_active = true;

alter table public.social_links enable row level security;

do $$
begin
  create policy "Public can read active social links" on public.social_links
    for select to anon, authenticated using (is_active = true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Authenticated users manage social links" on public.social_links
    for all to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

grant select on public.social_links to anon, authenticated;
grant insert, update, delete on public.social_links to authenticated;

-- Conserva la configuracion previa de social_settings al migrar del enlace unico.
do $$
begin
  if to_regclass('public.social_settings') is not null then
    execute $migration$
      insert into public.social_links
        (network, url, label, is_active, open_in_new_tab, legacy_id)
      select network, url, label, is_active, open_in_new_tab, id
      from public.social_settings
      on conflict (legacy_id) do nothing
    $migration$;
  end if;
end $$;

-- En instalaciones nuevas agrega un ejemplo inactivo, sin destino operativo.
insert into public.social_links (network, url, label, is_active, display_order)
select 'whatsapp', 'https://api.whatsapp.com/send?phone=XXXXXXXXXXX',
  'Contactar por WhatsApp', false, 0
where not exists (select 1 from public.social_links);

notify pgrst, 'reload schema';
commit;

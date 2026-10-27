-- Migracion de instalaciones existentes. Conserva IDs, fotos, etiquetas y orden.
-- El propietario pasa de la sede a su edicion; borrar una sede ya no borra fotos.
begin;

lock table public.venues in share mode;
lock table public.venue_amenities in access exclusive mode;

alter table public.venue_amenities
  add column if not exists edition_id uuid,
  add column if not exists image_url text,
  add column if not exists alt_text text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'venue_amenities' and column_name = 'venue_id'
  ) then
    if exists (
      select 1 from public.venue_amenities a
      join public.venues v on v.id = a.venue_id
      where a.edition_id is not null and a.edition_id <> v.edition_id
    ) then
      raise exception 'Hay amenidades con edicion distinta a la de su sede. Revisa los datos antes de migrar.';
    end if;

    update public.venue_amenities a
    set edition_id = v.edition_id
    from public.venues v
    where a.venue_id = v.id and a.edition_id is null;
  end if;

  if exists (select 1 from public.venue_amenities where edition_id is null) then
    raise exception 'Hay amenidades sin edicion. La migracion no se aplico.';
  end if;
end $$;

alter table public.venue_amenities alter column edition_id set not null;

-- IF NOT EXISTS en una columna no agrega la FK si la columna ya existia.
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute source_column
      on source_column.attrelid = c.conrelid and source_column.attname = 'edition_id'
    join pg_attribute target_column
      on target_column.attrelid = c.confrelid and target_column.attname = 'id'
    where c.contype = 'f'
      and c.conrelid = 'public.venue_amenities'::regclass
      and c.confrelid = 'public.congress_editions'::regclass
      and c.conkey = array[source_column.attnum]
      and c.confkey = array[target_column.attnum]
  ) then
    alter table public.venue_amenities
      add constraint venue_amenities_edition_id_fkey
      foreign key (edition_id) references public.congress_editions(id) on delete cascade;
  end if;
end $$;

drop policy if exists "Public can read venue amenities" on public.venue_amenities;
alter table public.venue_amenities drop column if exists venue_id;

create policy "Public can read venue amenities" on public.venue_amenities
  for select using (exists (
    select 1 from public.congress_editions e
    where e.id = edition_id and e.status in ('published', 'archived')
  ));

create index if not exists venue_amenities_edition_order_idx
  on public.venue_amenities (edition_id, display_order);

notify pgrst, 'reload schema';
commit;

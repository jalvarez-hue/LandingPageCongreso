-- Permite que la landing consulte el año/ciudad de ediciones draft sin exponer
-- sus sedes o fotos hasta que la edición se publique o archive.
begin;

drop policy if exists "Public can read published editions" on public.congress_editions;
create policy "Public can read published editions" on public.congress_editions
  for select to anon, authenticated
  using (status in ('published', 'archived', 'draft'));

drop policy if exists "Public can read active venues" on public.venues;
create policy "Public can read active venues" on public.venues
  for select to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.congress_editions e
      where e.id = edition_id and e.status in ('published', 'archived')
    )
  );

notify pgrst, 'reload schema';
commit;

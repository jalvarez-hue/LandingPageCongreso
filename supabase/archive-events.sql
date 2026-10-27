-- Ejecutar despues de congreso.sql (y edition-amenities.sql en instalaciones antiguas).
-- Amplia instalaciones existentes y carga
-- el archivo original sin modificar sedes o amenidades ya capturadas.
begin;

alter table public.venues
  add column if not exists video_url text,
  add column if not exists video_label text;
alter table public.venue_amenities
  add column if not exists image_url text,
  add column if not exists alt_text text;

do $$
begin
  if not exists (select 1 from public.congress_editions where slug = 'mer-2025')
    or not exists (select 1 from public.congress_editions where slug = 'mty-2026') then
    raise exception 'Faltan las ediciones mer-2025 y mty-2026. Ejecuta congreso.sql primero.';
  end if;
end $$;

insert into public.venues (id, edition_id, name, address, description, image_url, video_url, video_label)
select 'a2025000-0000-4000-8000-000000000001'::uuid, id,
  'Congreso Merida 2025', '', '1ª edición.',
  '/assets/d7f164e01cafbbc498c76a3c4c0c6131.jpg',
  '/assets/92d7175b87818cce9487367ec978111e.mp4', 'Video de Mérida 2025'
from public.congress_editions where slug = 'mer-2025'
on conflict (id) do nothing;

insert into public.venues (id, edition_id, name, address, description, image_url, video_url, video_label)
select 'a2026000-0000-4000-8000-000000000001'::uuid, id,
  'Hilton Monterrey Valle', '', 'Hilton Monterrey Valle · 8 paneles · 145 asistentes.',
  '/assets/127d964bb9b403a6cb0d37db44e6dfda.jpg',
  '/assets/7928bd908fbb48380b3d6acdcfd46f9d.mp4', 'Video de Monterrey 2026'
from public.congress_editions where slug = 'mty-2026'
on conflict (id) do nothing;

insert into public.venue_amenities (id, edition_id, label, image_url, alt_text, display_order)
select photos.id::uuid, e.id, photos.label, photos.image_url, photos.alt_text, photos.display_order
from public.congress_editions e
cross join (values
  ('a2025000-0000-4000-8000-000000000002',
   'Actividad con el público en Mérida 2025', '/assets/be0c43d89e37811ce55c2ec8eab41cc9.jpg',
   'Actividad con el público en Mérida 2025', 1),
  ('a2025000-0000-4000-8000-000000000003',
   'Entrega de reconocimientos en Mérida 2025', '/assets/68df36a8595baeca9c61b0a303ef2417.jpg',
   'Entrega de reconocimientos en Mérida 2025', 2),
  ('a2025000-0000-4000-8000-000000000004',
   'Panel en el escenario de Mérida 2025', '/assets/3eb750a0199065679da45b1a9c0f6e69.jpg',
   'Panel en el escenario de Mérida 2025', 3)
) as photos(id, label, image_url, alt_text, display_order)
where e.slug = 'mer-2025'
on conflict (id) do nothing;

commit;

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('./archive.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const context = { exports: {} };
runInNewContext(source, context);
const toArchive = (data) => JSON.parse(JSON.stringify(context.exports.toArchive(data)));

const photo = { id: 'photo-1', label: 'Actividad', image_url: '/photo.jpg', alt_text: null, display_order: 1 };
const venue = { id: 'venue-1', description: 'Primera edición.', image_url: '/poster.jpg', video_url: '/video.mp4', video_label: null };
const edition = { id: 'edition-2025', year: 2025, city: 'Mérida', venues: [venue], venue_amenities: [photo] };

test('el archivo usa la edición como identidad y conserva el formato público', () => {
  assert.deepEqual(toArchive([edition]), [{
    id: 'edition-2025',
    year: '2025 · Mérida',
    description: 'Primera edición.',
    video: '/video.mp4',
    poster: '/poster.jpg',
    videoLabel: 'Video de Mérida 2025',
    photos: [{ id: 'photo-1', src: '/photo.jpg', alt: 'Actividad' }],
  }]);
});

test('las fotos pertenecen a la edición incluso sin sede activa', () => {
  const [event] = toArchive([{ ...edition, venues: [] }]);
  assert.equal(event.id, edition.id);
  assert.equal(event.video, null);
  assert.equal(event.poster, null);
  assert.equal(event.description, '');
  assert.deepEqual(event.photos, [{ id: photo.id, src: photo.image_url, alt: photo.label }]);
});

test('varias sedes no duplican la edición ni sus fotos; usa la primera sede ordenada por la consulta', () => {
  const events = toArchive([{ ...edition, venues: [venue, { ...venue, id: 'venue-2', video_url: '/other.mp4' }] }]);
  assert.equal(events.length, 1);
  assert.equal(events[0].video, venue.video_url);
  assert.equal(events[0].photos.length, 1);
});

test('las fotos no se mezclan entre ediciones y se ordenan sin mutar los registros', () => {
  const second = { ...edition, id: 'edition-2026', year: 2026, city: 'Monterrey', venue_amenities: [] };
  const records = [
    { ...photo, id: 'last', image_url: '/last.jpg', display_order: 3 },
    { ...photo, id: 'amenity', image_url: null, display_order: 0 },
    { ...photo, id: 'first', alt_text: 'Texto alternativo', display_order: 1 },
  ];
  const before = JSON.stringify(records);
  const events = toArchive([second, { ...edition, venue_amenities: records }]);
  assert.deepEqual(events.map((event) => event.id), [edition.id, second.id]);
  assert.deepEqual(events[0].photos.map((item) => item.id), ['first', 'last']);
  assert.equal(events[0].photos[0].alt, 'Texto alternativo');
  assert.deepEqual(events[1].photos, []);
  assert.equal(JSON.stringify(records), before);
});

test('acepta archivo vacío y rechaza respuestas o relaciones inválidas', () => {
  assert.deepEqual(toArchive([]), []);
  for (const invalid of [
    null,
    {},
    [null],
    [{ ...edition, venues: null }],
    [{ ...edition, year: 1999 }],
    [{ ...edition, venues: [{ ...venue, video_url: 7 }] }],
    [{ ...edition, venue_amenities: [{ ...photo, display_order: '1' }] }],
  ]) {
    assert.throws(() => toArchive(invalid));
  }
});

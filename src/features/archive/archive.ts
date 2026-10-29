export interface ArchiveEvent {
  id: string;
  status: 'draft' | 'published' | 'archived';
  year: string;
  description: string;
  video: string | null;
  poster: string | null;
  videoLabel: string;
  photos: { id: string; src: string; alt: string }[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isEditionStatus(value: unknown): value is ArchiveEvent['status'] {
  return value === 'draft' || value === 'published' || value === 'archived';
}

function formatDraftDates(startsOn: string | null, endsOn: string | null): string {
  if (!startsOn) return 'Más información pronto.';
  const formatDate = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('es-MX', options).format(new Date(`${date}T00:00:00`));
  if (!endsOn || startsOn === endsOn) return `${formatDate(startsOn, { day: 'numeric', month: 'long' })}.`;

  const startsInSameMonth = startsOn.slice(0, 7) === endsOn.slice(0, 7);
  const start = formatDate(startsOn, startsInSameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'long' });
  const end = formatDate(endsOn, { day: 'numeric', month: 'long' });
  return `${start} al ${end}.`;
}

export function toArchive(data: unknown): ArchiveEvent[] {
  if (!Array.isArray(data)) throw new Error('Respuesta de archivo inválida.');

  return data.map((edition: unknown) => {
    if (
      !isRecord(edition) ||
      typeof edition.id !== 'string' ||
      typeof edition.year !== 'number' ||
      !Number.isInteger(edition.year) ||
      edition.year < 2000 ||
      edition.year > 2100 ||
      typeof edition.city !== 'string' ||
      !isEditionStatus(edition.status) ||
      !isNullableString(edition.starts_on) ||
      !isNullableString(edition.ends_on) ||
      !Array.isArray(edition.venues) ||
      !Array.isArray(edition.venue_amenities)
    ) {
      throw new Error('Datos de edición inválidos en el archivo.');
    }

    const venues = edition.venues.map((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item.id !== 'string' ||
        !isNullableString(item.description) ||
        !isNullableString(item.video_url) ||
        !isNullableString(item.video_label) ||
        !isNullableString(item.image_url)
      ) {
        throw new Error('Datos de sede inválidos en el archivo.');
      }
      return { description: item.description, video: item.video_url, videoLabel: item.video_label, poster: item.image_url };
    });
    const venue = venues[0];
    const isUpcoming = edition.status === 'draft';
    const photos = edition.venue_amenities.map((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item.id !== 'string' ||
        typeof item.label !== 'string' ||
        !isNullableString(item.image_url) ||
        !isNullableString(item.alt_text) ||
        typeof item.display_order !== 'number' ||
        !Number.isFinite(item.display_order)
      ) {
        throw new Error('Datos de fotografía inválidos en el archivo.');
      }
      return { src: item.image_url, alt: item.alt_text?.trim() || item.label, order: item.display_order, id: item.id };
    }).sort((first, second) => first.order - second.order || first.id.localeCompare(second.id))
      .flatMap((item) => item.src
        ? [{ id: item.id, src: item.src, alt: item.alt }]
        : []);

    return {
      year: edition.year,
      event: {
        id: edition.id,
        status: edition.status,
        year: `${edition.year} · ${edition.city}`,
        description: isUpcoming
          ? formatDraftDates(edition.starts_on, edition.ends_on)
          : venue?.description ?? '',
        video: isUpcoming ? null : venue?.video || null,
        poster: isUpcoming ? null : venue?.poster || null,
        videoLabel: venue?.videoLabel?.trim() || `Video de ${edition.city} ${edition.year}`,
        photos: isUpcoming ? [] : photos,
      },
    };
  }).sort((first, second) => first.year - second.year || first.event.id.localeCompare(second.event.id))
    .map((item) => item.event);
}

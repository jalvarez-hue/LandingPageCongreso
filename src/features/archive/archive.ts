export interface ArchiveEvent {
  id: string;
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
        year: `${edition.year} · ${edition.city}`,
        description: venue?.description ?? '',
        video: venue?.video || null,
        poster: venue?.poster || null,
        videoLabel: venue?.videoLabel?.trim() || `Video de ${edition.city} ${edition.year}`,
        photos,
      },
    };
  }).sort((first, second) => first.year - second.year).map((item) => item.event);
}

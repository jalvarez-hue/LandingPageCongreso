import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { toGenericError } from '../../lib/errorReporter';
import styles from './VenueSection.module.css';

type PublicVenue = {
  name: string;
  address: string;
  description: string | null;
  image_url: string | null;
  google_maps_url: string | null;
  amenities: { id: string; label: string }[];
};

type VenueQueryResult = Omit<PublicVenue, 'amenities'> & {
  congress_editions: {
    venue_amenities: { id: string; label: string; image_url: string | null; display_order: number }[];
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isVenueQueryResult(value: unknown): value is VenueQueryResult {
  if (!isRecord(value)) return false;
  const nullableFields = ['description', 'image_url', 'google_maps_url'] as const;
  if (
    typeof value.name !== 'string' || typeof value.address !== 'string' ||
    !nullableFields.every((field) => value[field] === null || typeof value[field] === 'string') ||
    !isRecord(value.congress_editions) || !Array.isArray(value.congress_editions.venue_amenities)
  ) return false;
  return value.congress_editions.venue_amenities.every((item: unknown) =>
    isRecord(item) && typeof item.id === 'string' && typeof item.label === 'string' &&
    (item.image_url === null || typeof item.image_url === 'string') &&
    typeof item.display_order === 'number' && Number.isFinite(item.display_order));
}

export function VenueSection() {
  const [venue, setVenue] = useState<PublicVenue | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const controller = new AbortController();
    const loadVenue = async () => {
      try {
        const { data, error } = await client
          .from('venues')
          .select('name, address, description, image_url, google_maps_url, congress_editions!inner(status, venue_amenities(id, label, image_url, display_order))')
          .eq('is_active', true)
          .eq('congress_editions.status', 'published')
          .order('updated_at', { ascending: false })
          .limit(1)
          .abortSignal(controller.signal)
          .maybeSingle();
        if (controller.signal.aborted) return;
        if (error) throw error;
        if (!data) return;
        if (!isVenueQueryResult(data)) throw new Error('Datos de sede o amenidades de edición inválidos.');
        setVenue({
          name: data.name,
          address: data.address,
          description: data.description,
          image_url: data.image_url,
          google_maps_url: data.google_maps_url,
          amenities: data.congress_editions.venue_amenities.filter((item) => !item.image_url).sort((first, second) => first.display_order - second.display_order),
        });
      } catch (error: unknown) {
        if (!controller.signal.aborted) setErrorMessage(toGenericError(error, 'venue.load'));
      }
    };
    void loadVenue();
    return () => controller.abort();
  }, []);

  if (errorMessage) return <p role="alert">{errorMessage}</p>;
  if (!venue) return null;

  return (
    <section className={styles.section} aria-labelledby="venue-title">
      <div className={styles.content}>
        <div>
          <span className={styles.eyebrow}>Sede</span>
          <h2 id="venue-title">Donde sucede la conversación</h2>
          <p className={styles.address}>{venue.name}<br />{venue.address}</p>
          {venue.description && <p className={styles.description}>{venue.description}</p>}
          {venue.amenities.length > 0 && <ul className={styles.amenities}>{venue.amenities.map((amenity) => <li key={amenity.id}>{amenity.label}</li>)}</ul>}
          {venue.google_maps_url && <a className={styles.mapLink} href={venue.google_maps_url} target="_blank" rel="noreferrer">Ver en Google Maps</a>}
        </div>
        {venue.image_url && <img className={styles.image} src={venue.image_url} alt={venue.name} loading="lazy" />}
      </div>
    </section>
  );
}

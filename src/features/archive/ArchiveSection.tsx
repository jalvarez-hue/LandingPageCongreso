import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { toGenericError } from '../../lib/errorReporter';
import { toArchive } from './archive';
import type { ArchiveEvent } from './archive';
import styles from './ArchiveSection.module.css';

export function ArchiveSection() {
  const [archive, setArchive] = useState<ArchiveEvent[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setErrorMessage('El archivo de eventos no está disponible: falta configurar Supabase.');
      setStatus('error');
      return;
    }
    const controller = new AbortController();
    const loadArchive = async () => {
      try {
        const { data, error } = await client
          .from('congress_editions')
          .select('id, year, city, venues(id, description, image_url, video_url, video_label), venue_amenities(id, label, image_url, alt_text, display_order)')
          .eq('status', 'archived')
          .eq('venues.is_active', true)
          .order('year')
          .order('updated_at', { referencedTable: 'venues', ascending: false })
          .order('id', { referencedTable: 'venues' })
          .abortSignal(controller.signal);
        if (controller.signal.aborted) return;
        if (error) throw error;
        const items = toArchive(data);
        setArchive(items);
        setStatus('ready');
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setErrorMessage(toGenericError(error, 'archive.load'));
        setStatus('error');
      }
    };
    void loadArchive();
    return () => controller.abort();
  }, []);

  return (
    <section id="revivir-eventos" aria-labelledby="archive-title" className={styles['cn-archive']}>
      <div className={styles['cn-content']}>
        <h2 id="archive-title" className={styles['cn-title']}>Revivir Eventos</h2>
        {status === 'loading' && <p role="status">Cargando eventos…</p>}
        {status === 'error' && <p role="alert">{errorMessage}</p>}
        {status === 'ready' && archive.length === 0 && <p>Aún no hay eventos archivados.</p>}
        <div className={styles['cn-grid']}>
          {archive.map((edition) => (
            <article key={edition.id} className={styles['cn-card']}>
              <h3 className={styles['cn-year']}>{edition.year}</h3>
              {edition.description && <p>{edition.description}</p>}
              {edition.video ? (
                <video
                  src={edition.video}
                  poster={edition.poster ?? undefined}
                  controls
                  playsInline
                  preload="none"
                  aria-label={edition.videoLabel}
                  width="640"
                  height="360"
                  className={styles['cn-video']}
                />
              ) : edition.poster && (
                <img src={edition.poster} alt={`Portada de ${edition.year}`} loading="lazy" width="640" height="360" className={styles['cn-video']} />
              )}
              {edition.photos.length > 0 && (
                <div className={styles['cn-photos']}>
                  {edition.photos.map((photo) => (
                    <img key={photo.id} src={photo.src} alt={photo.alt} loading="lazy" width="320" height="200" className={styles['cn-photo']} />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

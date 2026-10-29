import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { toGenericError } from '../../lib/errorReporter';
import { toArchive } from './archive';
import type { ArchiveEvent } from './archive';
import styles from './ArchiveSection.module.css';

export function ArchiveSection() {
  const [archive, setArchive] = useState<ArchiveEvent[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselEditions = archive.filter((edition) => edition.status !== 'draft');
  const upcomingEditions = archive.filter((edition) => edition.status === 'draft');

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
          .select('id, year, city, status, starts_on, ends_on, venues(id, description, image_url, video_url, video_label), venue_amenities(id, label, image_url, alt_text, display_order)')
          .in('status', ['draft', 'published', 'archived'])
          .eq('venues.is_active', true)
          .order('year')
          .order('updated_at', { referencedTable: 'venues', ascending: false })
          .order('id', { referencedTable: 'venues' })
          .abortSignal(controller.signal);
        if (controller.signal.aborted) return;
        if (error) throw error;
        setArchive(toArchive(data));
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

  const scrollCarousel = (direction: -1 | 1) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.85,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <section id="revivir-eventos" aria-labelledby="archive-title" className={styles['cn-archive']}>
      <div className={styles['cn-content']}>
        <div className={styles['cn-heading-row']}>
          <h2 id="archive-title" className={styles['cn-title']}>Revive cada edición</h2>
          {status === 'ready' && carouselEditions.length > 1 && (
            <div className={styles['cn-controls']} aria-label="Controles del carrusel">
              <button type="button" onClick={() => scrollCarousel(-1)} aria-label="Ver ediciones anteriores">
                <span aria-hidden="true">←</span>
              </button>
              <button type="button" onClick={() => scrollCarousel(1)} aria-label="Ver ediciones siguientes">
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
        {status === 'loading' && <p role="status">Cargando eventos…</p>}
        {status === 'error' && <p role="alert">{errorMessage}</p>}
        {status === 'ready' && (
          <div className={`${styles['cn-events-layout']} ${upcomingEditions.length > 0 ? styles['cn-events-layout-upcoming'] : ''}`}>
            {carouselEditions.length > 0 ? (
              <div className={styles['cn-carousel']} role="region" aria-label="Ediciones anteriores y publicadas">
                <div
                  ref={carouselRef}
                  className={`${styles['cn-track']} ${upcomingEditions.length > 0 ? styles['cn-track-with-upcoming'] : ''}`}
                  tabIndex={0}
                >
                  {carouselEditions.map((edition) => <ArchiveCard key={edition.id} edition={edition} />)}
                </div>
              </div>
            ) : archive.length === 0 ? (
              <div className={styles['cn-empty-placement']}><EmptyArchiveCard /></div>
            ) : null}
            {upcomingEditions.length > 0 && (
              <div className={styles['cn-upcoming-list']} aria-label="Próximas ediciones">
                {upcomingEditions.map((edition) => <UpcomingCard key={edition.id} edition={edition} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ArchiveCard({ edition }: { edition: ArchiveEvent }) {
  return (
    <article className={styles['cn-card']}>
      <span className={styles['cn-eyebrow']}>Fotos y videos</span>
      <h3 className={styles['cn-year']}>{edition.year}</h3>
      {edition.description && <p className={styles['cn-description']}>{edition.description}</p>}
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
      ) : edition.poster ? (
        <img src={edition.poster} alt={`Portada de ${edition.year}`} loading="lazy" width="640" height="360" className={styles['cn-video']} />
      ) : (
        <div className={styles['cn-video-placeholder']}>Video no disponible</div>
      )}
      <div className={styles['cn-photos']}>
        {edition.photos.length > 0
          ? edition.photos.map((photo) => (
            <img key={photo.id} src={photo.src} alt={photo.alt} loading="lazy" width="320" height="200" className={styles['cn-photo']} />
          ))
          : [1, 2, 3].map((slot) => (
            <div key={slot} className={styles['cn-photo-placeholder']}>
              <span>Foto no disponible</span>
            </div>
          ))}
      </div>
    </article>
  );
}

function UpcomingCard({ edition }: { edition: ArchiveEvent }) {
  return (
    <article className={`${styles['cn-card']} ${styles['cn-upcoming']}`}>
      <span className={styles['cn-eyebrow']}>Fotos y videos</span>
      <h3 className={styles['cn-year']}>{edition.year}</h3>
      <p className={styles['cn-description']}>{edition.description}</p>
      <div className={styles['cn-coming-soon']}>
        <strong>Próximamente</strong>
        <span>Las fotos y videos de esta edición aparecerán aquí.</span>
      </div>
    </article>
  );
}

function EmptyArchiveCard() {
  return (
    <article className={`${styles['cn-card']} ${styles['cn-empty-card']}`}>
      <span className={styles['cn-eyebrow']}>Fotos y videos</span>
      <h3 className={styles['cn-year']}>Aún sin eventos</h3>
      <p className={styles['cn-description']}>Cuando haya ediciones y contenido, aparecerán aquí.</p>
      <div className={styles['cn-coming-soon']}>
        <strong>Próximamente</strong>
        <span>Estamos preparando este espacio.</span>
      </div>
    </article>
  );
}

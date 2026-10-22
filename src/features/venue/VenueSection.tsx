import { useEffect, useState } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { supabase } from '../../lib/supabaseClient';
import styles from './VenueSection.module.css';

const targetDate = new Date('2027-09-01T00:00:00-06:00').getTime();

const archive = [
  {
    id: 'merida-2025',
    year: '2025 · Mérida',
    description: '1ª edición.',
    video: '/assets/92d7175b87818cce9487367ec978111e.mp4',
    poster: '/assets/d7f164e01cafbbc498c76a3c4c0c6131.jpg',
    videoLabel: 'Video de Mérida 2025',
    photos: [
      {
        src: '/assets/be0c43d89e37811ce55c2ec8eab41cc9.jpg',
        alt: 'Actividad con el público en Mérida 2025',
      },
      {
        src: '/assets/68df36a8595baeca9c61b0a303ef2417.jpg',
        alt: 'Entrega de reconocimientos en Mérida 2025',
      },
      {
        src: '/assets/3eb750a0199065679da45b1a9c0f6e69.jpg',
        alt: 'Panel en el escenario de Mérida 2025',
      },
    ],
  },
  {
    id: 'monterrey-2026',
    year: '2026 · Monterrey',
    description: 'Hilton Monterrey Valle · 8 paneles · 145 asistentes.',
    video: '/assets/7928bd908fbb48380b3d6acdcfd46f9d.mp4',
    poster: '/assets/127d964bb9b403a6cb0d37db44e6dfda.jpg',
    videoLabel: 'Video de Monterrey 2026',
    photos: [],
  },
] as const;

export function VenueSection() {
  const [venue, setVenue] = useState<{ name: string; address: string; description: string | null; image_url: string | null; google_maps_url: string | null } | null>(null);
  const time = useCountdown(targetDate);
  const digits = [
    { id: 'days', value: time.days, label: 'Días' },
    { id: 'hours', value: time.hours, label: 'Horas' },
    { id: 'minutes', value: time.minutes, label: 'Minutos' },
    { id: 'seconds', value: time.seconds, label: 'Segundos' },
  ] as const;

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const loadVenue = async () => {
      const { data, error } = await client
        .from('venues')
        .select('name, address, description, image_url, google_maps_url')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) setVenue(data);
    };

    void loadVenue();
  }, []);

  return (
    <section id="sede" aria-labelledby="sede-title" className={`${styles.scope} cn-style-a0a73029`}>
      <img
        className="cn-deco cn-style-fb43b2d2"
        src="/assets/f96eaed752373f53bc9e674574e2f73d.png"
        alt=""
        aria-hidden="true"
        width="170"
        height="170"
        loading="lazy"
      />
      <div className="cn-style-5b2d6575">
        <div className="cn-style-6f010eb3">
          <div className="cn-style-99e0d306">
            <div className="cn-style-bdd32329">3ª edición</div>
            <h2 id="sede-title" className="cn-style-5aecaaa6">
              Nos vemos en <span className="cn-style-3bb8a8ec">Guadalajara</span>
            </h2>
            <p className="cn-style-9a856fd7">
              La 3ª edición será del 1 al 4 de septiembre de 2027 en Guadalajara, Jalisco.
              Esto es lo que falta para encontrarnos.
            </p>
          </div>
        </div>
        {venue && (
          <article className="cn-style-a0593b85">
            <span className="cn-style-f9eb89cc">Sede confirmada</span>
            <span className="cn-style-287f21e3">{venue.name}</span>
            <span className="cn-style-e662d2a7">{venue.address}</span>
            {venue.description && <p className="cn-style-e662d2a7">{venue.description}</p>}
            {venue.image_url && <img src={venue.image_url} alt={venue.name} loading="lazy" className="cn-style-9e0e05e1" />}
            {venue.google_maps_url && <a href={venue.google_maps_url} target="_blank" rel="noreferrer" className="cn-style-d60b5c98">Ver en Google Maps</a>}
          </article>
        )}
        {time.complete ? (
          <div className="cn-style-005e9b85">¡Hoy empieza en Guadalajara!</div>
        ) : (
          <div
            role="timer"
            aria-label="Cuenta regresiva para el congreso en Guadalajara"
            className="cn-style-3911d223"
          >
            {digits.map((digit, index) => (
              <div key={digit.id} className="cn-style-a234f5c8">
                <div className={index === 0 ? 'cn-style-f08bb089' : 'cn-style-5cee0daf'}>
                  <div
                    aria-hidden="true"
                    className={index === 0 ? 'cn-style-62df158c' : 'cn-style-c4ab6728'}
                  />
                  <span
                    className={`cn-flip ${index === 0 ? 'cn-style-17b5b608' : 'cn-style-ca7203ab'}`}
                  >
                    {String(digit.value).padStart(2, '0')}
                  </span>
                  <div
                    aria-hidden="true"
                    className={index === 0 ? 'cn-style-8a07e915' : 'cn-style-efe862be'}
                  />
                  <div aria-hidden="true" className="cn-style-013ae215" />
                  <div aria-hidden="true" className="cn-style-6e95327d" />
                </div>
                <span className="cn-style-a75108b6">{digit.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="cn-style-8c48f0d9">
          <h3 className="cn-style-7fc47803">Revive cada edición</h3>
          <div className="cn-style-e271afea">
            {archive.map((edition) => (
              <article key={edition.id} className="cn-style-a0593b85">
                <span className="cn-style-f9eb89cc">Fotos y videos</span>
                <span className="cn-style-287f21e3">{edition.year}</span>
                <span className="cn-style-e662d2a7">{edition.description}</span>
                <video
                  src={edition.video}
                  poster={edition.poster}
                  controls
                  playsInline
                  preload="none"
                  aria-label={edition.videoLabel}
                  width="640"
                  height="360"
                  className="cn-style-9e0e05e1"
                />
                <div className="cn-style-63fc4ed3">
                  {edition.photos.length > 0
                    ? edition.photos.map((photo) => (
                        <img
                          key={photo.src}
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          width="320"
                          height="200"
                          className="cn-style-dd00f5a0"
                        />
                      ))
                    : Array.from({ length: 3 }, (_, index) => (
                        <div key={`photo-placeholder-${index + 1}`} className="cn-style-c8af1db9">
                          <span className="cn-style-bb24ccc6">[FOTO]</span>
                        </div>
                      ))}
                </div>
              </article>
            ))}
            <article className="cn-style-c2ac99f2">
              <span className="cn-style-f9eb89cc">Fotos y videos</span>
              <span className="cn-style-4ac83bbd">2027 · Guadalajara</span>
              <span className="cn-style-e662d2a7">1 al 4 de septiembre.</span>
              <div className="cn-style-1b179b5a">
                <span className="cn-style-76da3ef7">Próximamente</span>
                <span className="cn-style-4e55d26e">
                  Las fotos y videos de la 3ª edición aparecerán aquí.
                </span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

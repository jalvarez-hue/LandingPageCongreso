import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { supabase } from '../../lib/supabaseClient';
import styles from './HeroSection.module.css';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(reducedMotion);
  const [editionDetails, setEditionDetails] = useState<{
    locationAndDates: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const controller = new AbortController();
    const loadEditionDetails = async () => {
      const { data, count, error } = await client
        .from('congress_editions')
        .select('city, year, starts_on, ends_on, status', { count: 'exact' })
        .order('year', { ascending: false })
        .abortSignal(controller.signal);

      if (controller.signal.aborted) return;
      if (error || count === null) {
        console.error('No fue posible cargar los datos de la edición de portada.', error);
        return;
      }

      const edition =
        data.find((item) => item.status === 'draft') ??
        data.find((item) => item.status === 'published');
      if (!edition) return;

      const formatter = new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const start = edition.starts_on ? new Date(`${edition.starts_on}T12:00:00`) : null;
      const end = edition.ends_on ? new Date(`${edition.ends_on}T12:00:00`) : null;
      if (
        (start && Number.isNaN(start.getTime())) ||
        (end && Number.isNaN(end.getTime())) ||
        (start && end && end < start)
      ) {
        console.error('Las fechas de la edición de portada no son válidas.', edition);
        setEditionDetails({
          locationAndDates: `${edition.city} · ${edition.year} · Fechas por confirmar`,
          count,
        });
        return;
      }

      const singleDate = start ?? end;
      const dates = start && end
        ? formatter.formatRange(start, end)
        : singleDate
          ? formatter.format(singleDate)
          : String(edition.year);
      setEditionDetails({
        locationAndDates: `${edition.city} · ${dates}`,
        count,
      });
    };

    void loadEditionDetails();
    return () => controller.abort();
  }, []);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      void video.play().then(() => setIsPaused(false)).catch((error: unknown) => {
        console.error('No fue posible reproducir el video de portada.', error);
      });
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  return (
    <section id="inicio" aria-labelledby="inicio-title" className={`${styles.scope} cn-style-1167bcd8`}>
      <video
        ref={videoRef}
        src="/assets/3a921e2cedc722d150f99b9549e73349.mp4"
        poster="/assets/ec81aaf4876eea5c88ed4b9a458e9973.jpg"
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        aria-hidden="true"
        className="cn-style-524cc27a"
      />
      <div aria-hidden="true" className="cn-style-3287edb2" />
      <button
        type="button"
        onClick={toggleVideo}
        aria-label={`${isPaused ? 'Reproducir' : 'Pausar'} video de fondo`}
        className="cn-style-14367d2e"
      >
        {isPaused ? 'Reproducir video' : 'Pausar video'}
      </button>
      <div className="cn-style-ba887944">
        <div className="cn-style-e2c44d03">
          <span className="cn-style-d1c11def">
            {editionDetails?.locationAndDates ?? 'Congreso Nacional Aseguradoras y Hospitales'}
          </span>
          {editionDetails && editionDetails.count > 0 && (
            <>
              <span className="cn-style-6b7ef86d" aria-hidden="true" />
              <span className="cn-style-f0ce8aeb">{editionDetails.count}ª edición</span>
            </>
          )}
        </div>
        <h1 id="inicio-title" className="cn-style-1df813c7">
          El futuro de la salud
          <br />
          evoluciona{' '}
          <span className="cn-style-3bb8a8ec">
            cuando hablamos
            <br />
            unos con otros.
          </span>
        </h1>
        <p className="cn-style-d924e678">
          El encuentro anual donde aseguradoras, hospitales, médicos y proveedores de salud
          conversan, frente a frente, sobre los temas que definen el futuro de la salud en México.
        </p>
        <div className="cn-style-2155d769">
          <a href="#patrocinio" className="cn-style-caace99d">
            Sé parte del evento <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

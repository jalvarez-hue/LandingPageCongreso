import { useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './HeroSection.module.css';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(reducedMotion);

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
          <span className="cn-style-d1c11def">Guadalajara · 1–4 septiembre 2027</span>
          <span className="cn-style-6b7ef86d" aria-hidden="true" />
          <span className="cn-style-f0ce8aeb">3ª edición</span>
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

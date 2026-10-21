import { Pause, Play, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import styles from './Hero.module.css';

export function Hero() {
  const [paused, setPaused] = useState(false);
  return <section className={styles.hero} id="inicio"><video className={styles.video} src="/assets/3a921e2cedc722d150f99b9549e73349.mp4" poster="/assets/ec81aaf4876eea5c88ed4b9a458e9973.jpg" autoPlay muted loop playsInline aria-hidden="true" ref={(element) => { if (element && window.matchMedia('(prefers-reduced-motion: reduce)').matches) element.pause(); }} /><div className={styles.overlay} /><div className={styles.content}><div className={styles.meta}><span>Guadalajara · 1–4 septiembre 2027</span><span>3ª edición</span></div><h1>El futuro de la salud<br />evoluciona <em>cuando hablamos<br />unos con otros.</em></h1><p>El encuentro anual donde aseguradoras, hospitales, médicos y proveedores de salud conversan, frente a frente, sobre los temas que definen el futuro de la salud en México.</p><a className={styles.primary} href="#patrocinio">Sé parte del evento <ArrowRight size={18} aria-hidden="true" /></a></div><button className={styles.videoButton} type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Reproducir video de fondo' : 'Pausar video de fondo'}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? 'Reproducir video' : 'Pausar video'}</button></section>;
}

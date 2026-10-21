import styles from './MediaPartners.module.css';

const partners = [
  { name: 'Revista Siniestro', src: '/assets/10bc17cef0d97ecd55684008e72be5c4.jpg' },
  { name: 'Hudle, estrategia de marca', src: '/assets/1d0ddaff8e872f266e2dcd9cb75ac27d.png' },
  { name: 'El Asegurador', src: '/assets/49664b8cac45ec14d0fe1aa23e8245ab.jpg' },
  { name: 'Central Media', src: '/assets/06a492bf5fb723c18a93432169067ff2.jpg' },
];

export function MediaPartners() { return <section className={styles.section} id="medios" aria-labelledby="media-title"><div className={styles.container}><p className={styles.kicker}>Medios aliados</p><h2 id="media-title">La conversación continúa.</h2><div className={styles.grid}>{partners.map((partner) => <div className={styles.partner} key={partner.name}><img src={partner.src} alt={partner.name} loading="lazy" /></div>)}</div></div></section>; }

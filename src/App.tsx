import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './features/hero/Hero';
import { Stats } from './features/stats/Stats';
import { Perspectives } from './features/perspectives/Perspectives';
import { Panels } from './features/panels/Panels';
import { Countdown } from './features/countdown/Countdown';
import { VideoArchive } from './features/video/VideoArchive';
import { ContactForm } from './features/contact-form/ContactForm';
import { MediaPartners } from './features/media/MediaPartners';
import styles from './App.module.css';

export default function App() {
  return <div className={styles.app}>
    <Header />
    <main>
      <Hero />
      <Stats />
      <Perspectives />
      <section className={styles.sponsors} id="patrocinadores"><div className={styles.container}><p className={styles.kicker}>Patrocinadores 2027</p><h2>Las marcas que<br />impulsan la 3ª edición</h2><p className={styles.lead}>Estamos construyendo esta lista: sé de los primeros en aparecer.</p><div className={styles.sponsorGrid}>{['Diamante', 'Oro', 'Plata', 'Branding'].map((tier) => <a href="#patrocinio" className={styles.sponsor} key={tier}><span>Patrocinador</span><strong>{tier}</strong><small>Quiero ser parte de la conversación.</small></a>)}</div></div></section>
      <Panels />
      <section className={styles.opportunities} id="espacios"><div className={styles.container}><p className={styles.kicker}>Espacios de patrocinio 2027</p><h2>Tipos de patrocinio</h2><div className={styles.opportunityGrid}>{['Diamante', 'Oro', 'Plata', 'Branding'].map((tier) => <a href="#patrocinio" key={tier}>{tier}<span>Me interesa <span aria-hidden="true">→</span></span></a>)}</div></div></section>
      <Countdown />
      <VideoArchive />
      <ContactForm />
      <MediaPartners />
    </main>
    <Footer />
  </div>;
}

import { useEffect, useState } from 'react';
import { AdminApp } from './admin/AdminApp';
import { SectionBoundary } from './components/layout/SectionBoundary';
import { SiteFooter } from './features/footer/SiteFooter';
import { HeroSection } from './features/hero/HeroSection';
import { SiteHeader } from './features/header/SiteHeader';
import { MediaSection } from './features/media/MediaSection';
import { PanelsSection } from './features/panels/PanelsSection';
import { PerspectivesSection } from './features/perspectives/PerspectivesSection';
import { SponsorsSection } from './features/sponsors/SponsorsSection';
import { StatsSection } from './features/stats/StatsSection';
import { SponsorshipLevels } from './features/levels/SponsorshipLevels';
import { ContactForm } from './features/contact/ContactForm';
import { VenueSection } from './features/venue/VenueSection';
import { supabase } from './lib/supabaseClient';
import type { SponsorshipSelection } from './types/congress';
import './styles/base.css';

const initialSelection: SponsorshipSelection = { interest: '', level: '' };

export function App() {
  const [selection, setSelection] = useState(initialSelection);
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === '#admin');

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const controller = new AbortController();
    const loadTitle = async () => {
      const { count, error } = await client
        .from('congress_editions')
        .select('id', { count: 'exact', head: true })
        .abortSignal(controller.signal);

      if (controller.signal.aborted) return;
      if (error || count === null) {
        console.error('No fue posible obtener el total de ediciones del congreso.', error);
        return;
      }

      const name = 'Congreso Nacional Aseguradoras y Hospitales';
      const ordinals: Record<number, string> = {
        1: '1er',
        2: '2do',
        3: '3er',
        4: '4to',
        5: '5to',
        6: '6to',
        7: '7mo',
        8: '8vo',
        9: '9no',
        10: '10mo',
      };
      document.title = count > 0 ? `${ordinals[count] ?? `${count}.º`} ${name}` : name;
    };

    void loadTitle();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const onHashChange = () => setIsAdmin(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (isAdmin) return <AdminApp />;

  return (
    <div className="cn-page">
      <SectionBoundary title="la navegación">
        <SiteHeader />
      </SectionBoundary>
      <main id="contenido">
        <SectionBoundary title="la portada"><HeroSection /></SectionBoundary>
        <SectionBoundary title="las cifras"><StatsSection /></SectionBoundary>
        <SectionBoundary title="las perspectivas"><PerspectivesSection /></SectionBoundary>
        <SectionBoundary title="los patrocinadores"><SponsorsSection /></SectionBoundary>
        <SectionBoundary title="los paneles"><PanelsSection /></SectionBoundary>
        <SectionBoundary title="los espacios de patrocinio">
          <SponsorshipLevels
            onSelect={(nextSelection) => setSelection(nextSelection)}
          />
        </SectionBoundary>
        <SectionBoundary title="la sede"><VenueSection /></SectionBoundary>
        <SectionBoundary title="el archivo de eventos"><ArchiveSection /></SectionBoundary>
        <SectionBoundary title="el formulario de patrocinio">
          <ContactForm selection={selection} onSelectionChange={setSelection} />
        </SectionBoundary>
        <SectionBoundary title="los medios aliados"><MediaSection /></SectionBoundary>
      </main>
      <SectionBoundary title="el pie de página"><SiteFooter /></SectionBoundary>
    </div>
  );
}

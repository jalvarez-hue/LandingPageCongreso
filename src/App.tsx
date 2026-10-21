import { useState } from 'react';
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
import type { SponsorshipSelection } from './types/congress';
import './styles/base.css';

const initialSelection: SponsorshipSelection = { interest: '', level: '' };

export function App() {
  const [selection, setSelection] = useState(initialSelection);

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
        <SectionBoundary title="el formulario de patrocinio">
          <ContactForm selection={selection} onSelectionChange={setSelection} />
        </SectionBoundary>
        <SectionBoundary title="los medios aliados"><MediaSection /></SectionBoundary>
      </main>
      <SectionBoundary title="el pie de página"><SiteFooter /></SectionBoundary>
    </div>
  );
}

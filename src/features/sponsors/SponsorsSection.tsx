import { sponsorLogos } from '../../data/sponsors';
import styles from './SponsorsSection.module.css';

const tiers = [
  { id: 'diamante', label: 'Patrocinador Diamante' },
  { id: 'oro', label: 'Patrocinador Oro' },
  { id: 'plata', label: 'Patrocinador Plata' },
] as const;

export function SponsorsSection() {
  const diamondLogos = sponsorLogos.filter((sponsor) => sponsor.tier === 'diamante');
  const goldLogos = sponsorLogos.filter((sponsor) => sponsor.tier === 'oro');
  const silverLogos = sponsorLogos.filter((sponsor) => sponsor.tier === 'plata');

  return (
    <section
      id="patrocinadores"
      aria-labelledby="patrocinadores-title"
      className={`${styles.scope} cn-style-f867d170`}
    >
      <div className="cn-style-42f1635b">
        <div className="cn-style-6f010eb3">
          <div className="cn-style-99e0d306">
            <div className="cn-style-b648f652">Patrocinadores 2027</div>
            <h2 id="patrocinadores-title" className="cn-style-2f394490">
              Las marcas que
              <br />
              impulsan la 3ª edición
            </h2>
            <p className="cn-style-ba97dc2a">
              Estamos construyendo esta lista: sé de los primeros en aparecer.
            </p>
          </div>
          <a href="#patrocinio" className="cn-style-530500c4">
            Quiero ser patrocinador <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="cn-style-52043572">
          {tiers.map((tier) => (
            <div key={tier.id} className="cn-style-bec22929">
              <span className="cn-style-3da7a6ce">{tier.label.replace('Patrocinador ', '')}</span>
              <span className="cn-style-8d4390e2">Tu marca aquí</span>
            </div>
          ))}
        </div>

        <div className="cn-style-5f79f986">
          <h3 className="cn-style-58c316d1">Nuestros patrocinadores 2026</h3>
          <span className="cn-style-da577a08" />
        </div>

        <div className="cn-style-ed1f3634">
          <SponsorTier label="Patrocinador Diamante" logos={diamondLogos} />
          <SponsorTier label="Patrocinador Oro" logos={goldLogos} />
          <SponsorTier label="Patrocinador Plata" logos={silverLogos} marquee />
        </div>
      </div>
    </section>
  );
}

interface SponsorTierProps {
  label: string;
  logos: typeof sponsorLogos;
  marquee?: boolean;
}

function SponsorTier({ label, logos, marquee = false }: SponsorTierProps) {
  return (
    <div className="cn-style-f0576fcc">
      <div className="cn-style-f5af09c0">
        <span className="cn-style-3da7a6ce">{label}</span>
        <span className="cn-style-da577a08" />
      </div>
      <div className={marquee ? 'cn-style-82ff934b cn-voces' : 'cn-style-52043572'}>
        <div className={marquee ? 'cn-style-51eb415b cn-voces-track' : 'cn-style-52043572'}>
          {logos.map((sponsor) => (
            <SponsorLogo key={sponsor.id} sponsor={sponsor} marquee={marquee} />
          ))}
          {marquee &&
            logos.map((sponsor) => (
              <SponsorLogo key={`${sponsor.id}-repeat`} sponsor={sponsor} marquee duplicate />
            ))}
        </div>
      </div>
    </div>
  );
}

interface SponsorLogoProps {
  sponsor: (typeof sponsorLogos)[number];
  marquee: boolean;
  duplicate?: boolean;
}

function SponsorLogo({ sponsor, marquee, duplicate = false }: SponsorLogoProps) {
  const className = marquee ? 'cn-style-ba11f8ef' : 'cn-style-ef40d51d';

  return (
    <div className={className} aria-hidden={duplicate || undefined}>
      <img
        src={sponsor.src}
        alt={duplicate ? '' : sponsor.name}
        width="360"
        height="160"
        loading="lazy"
        className="cn-style-7fd1c857"
      />
    </div>
  );
}

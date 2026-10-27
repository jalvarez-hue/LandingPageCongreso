import { useEffect, useState } from 'react';
import { sponsorLogos, type SponsorLogo } from '../../data/sponsors';
import { supabase } from '../../lib/supabaseClient';
import styles from './SponsorsSection.module.css';

const tiers = [
  { id: 'diamante', label: 'Patrocinador Diamante' },
  { id: 'oro', label: 'Patrocinador Oro' },
  { id: 'plata', label: 'Patrocinador Plata' },
] as const;

export function SponsorsSection() {
  const [logos, setLogos] = useState<readonly SponsorLogo[]>(sponsorLogos);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const loadSponsors = async () => {
      const [sponsorsResult, tiersResult] = await Promise.all([
        client
          .from('sponsors')
          .select('id, name, logo_url, tier_id, congress_editions!inner(status)')
          .eq('is_active', true)
          .eq('congress_editions.status', 'published')
          .order('display_order'),
        client.from('sponsorship_tiers').select('id, code').eq('is_active', true),
      ]);
      if (sponsorsResult.error || tiersResult.error || !sponsorsResult.data?.length) return;

      const tierCodes = new Map(
        (tiersResult.data as { id: string; code: string }[]).map((tier) => [tier.id, tier.code]),
      );
      const tierMap: Record<string, SponsorLogo['tier'] | undefined> = {
        diamante: 'diamante',
        oro: 'oro',
        plata: 'plata',
      };
      const remoteLogos = (sponsorsResult.data as { id: string; name: string; logo_url: string; tier_id: string }[])
        .map((sponsor) => ({
          id: sponsor.id,
          name: sponsor.name,
          src: sponsor.logo_url,
          tier: tierMap[tierCodes.get(sponsor.tier_id) ?? ''],
        }))
        .filter((sponsor): sponsor is SponsorLogo => Boolean(sponsor.tier));
      if (remoteLogos.length) setLogos(remoteLogos);
    };

    void loadSponsors();
  }, []);

  const diamondLogos = logos.filter((sponsor) => sponsor.tier === 'diamante');
  const goldLogos = logos.filter((sponsor) => sponsor.tier === 'oro');
  const silverLogos = logos.filter((sponsor) => sponsor.tier === 'plata');

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
          <SponsorTier label="Patrocinador Plata" logos={silverLogos} />
        </div>
      </div>
    </section>
  );
}

interface SponsorTierProps {
  label: string;
  logos: readonly SponsorLogo[];
}

function SponsorTier({ label, logos }: SponsorTierProps) {
  const isCarousel = logos.length > 6;

  if (logos.length === 0) return null;

  return (
    <div className={styles['cn-sponsor-tier']}>
      <div className="cn-style-f5af09c0">
        <span className="cn-style-3da7a6ce">{label}</span>
        <span className="cn-style-da577a08" />
      </div>
      <div
        className={isCarousel ? styles['cn-sponsor-marquee'] : styles['cn-sponsor-grid']}
        role={isCarousel ? 'region' : undefined}
        aria-roledescription={isCarousel ? 'carrusel' : undefined}
        aria-label={isCarousel ? label : undefined}
        aria-live={isCarousel ? 'off' : undefined}
        tabIndex={isCarousel ? 0 : undefined}
      >
        {isCarousel ? (
          <div className={styles['cn-sponsor-marquee-track']}>
            <div className={styles['cn-sponsor-marquee-group']}>
              {logos.map((sponsor) => (
                <SponsorLogo key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
            <div className={styles['cn-sponsor-marquee-group']} aria-hidden="true">
              {logos.map((sponsor) => (
                <SponsorLogo key={`duplicate-${sponsor.id}`} sponsor={sponsor} />
              ))}
            </div>
          </div>
        ) : (
          logos.map((sponsor) => <SponsorLogo key={sponsor.id} sponsor={sponsor} />)
        )}
      </div>
    </div>
  );
}

interface SponsorLogoProps {
  sponsor: SponsorLogo;
}

function SponsorLogo({ sponsor }: SponsorLogoProps) {
  return (
    <div className={styles['cn-sponsor-card']}>
      <img
        src={sponsor.src}
        alt={sponsor.name}
        width="360"
        height="160"
        loading="lazy"
        className={styles['cn-sponsor-logo']}
      />
    </div>
  );
}

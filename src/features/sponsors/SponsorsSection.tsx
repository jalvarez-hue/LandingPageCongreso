import { useEffect, useState } from 'react';
import type { SponsorLogo } from '../../data/sponsors';
import { supabase } from '../../lib/supabaseClient';
import { reportApplicationError } from '../../lib/errorReporter';
import styles from './SponsorsSection.module.css';

export function SponsorsSection() {
  const [logos, setLogos] = useState<readonly SponsorLogo[]>([]);
  const [publishedYear, setPublishedYear] = useState<number | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const controller = new AbortController();
    const loadSponsors = async () => {
      try {
        const editionResult = await client
          .from('congress_editions')
          .select('id, year')
          .eq('status', 'published')
          .abortSignal(controller.signal)
          .maybeSingle();
        if (controller.signal.aborted) return;
        if (editionResult.error) throw editionResult.error;
        if (!editionResult.data) {
          setPublishedYear(null);
          setLogos([]);
          return;
        }

        const edition = editionResult.data as { id: string; year: number };
        setPublishedYear(edition.year);
        const [sponsorsResult, tiersResult] = await Promise.all([
          client
            .from('sponsors')
            .select('id, name, logo_url, tier_id')
            .eq('edition_id', edition.id)
            .eq('is_active', true)
            .order('display_order')
            .abortSignal(controller.signal),
          client
            .from('sponsorship_tiers')
            .select('id, code')
            .eq('is_active', true)
            .abortSignal(controller.signal),
        ]);
        if (controller.signal.aborted) return;
        if (sponsorsResult.error) throw sponsorsResult.error;
        if (tiersResult.error) throw tiersResult.error;

        const tierCodes = new Map(
          (tiersResult.data ?? []).map((tier: { id: string; code: string }) => [tier.id, tier.code]),
        );
        const tierMap: Record<string, SponsorLogo['tier'] | undefined> = {
          diamante: 'diamante',
          oro: 'oro',
          plata: 'plata',
        };
        const remoteLogos = (sponsorsResult.data ?? [])
          .map((sponsor: { id: string; name: string; logo_url: string; tier_id: string }) => ({
            id: sponsor.id,
            name: sponsor.name,
            src: sponsor.logo_url,
            tier: tierMap[tierCodes.get(sponsor.tier_id) ?? ''],
          }))
          .filter((sponsor): sponsor is SponsorLogo => Boolean(sponsor.tier));
        setLogos(remoteLogos);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        console.error('No fue posible cargar los patrocinadores de la edición publicada.', error);
        void reportApplicationError(error, 'sponsors.load');
      }
    };

    void loadSponsors();
    return () => controller.abort();
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
            <div className="cn-style-b648f652">
              Patrocinadores{publishedYear ? ` ${publishedYear}` : ''}
            </div>
            <h2 id="patrocinadores-title" className="cn-style-2f394490">
              Las marcas que
              <br />
              impulsan esta edición
            </h2>
            <p className="cn-style-ba97dc2a">
              Conoce a las marcas que hacen posible este encuentro.
            </p>
          </div>
          <a href="#patrocinio" className="cn-style-530500c4">
            Quiero ser patrocinador <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="cn-style-5f79f986">
          <h3 className="cn-style-58c316d1">
            Nuestros patrocinadores{publishedYear ? ` ${publishedYear}` : ''}
          </h3>
          <span className="cn-style-da577a08" />
        </div>

        <div className="cn-style-ed1f3634">
          <SponsorTier tier="diamante" label="Patrocinador Diamante" logos={diamondLogos} />
          <SponsorTier tier="oro" label="Patrocinador Oro" logos={goldLogos} />
          <SponsorTier tier="plata" label="Patrocinador Plata" logos={silverLogos} />
        </div>
      </div>
    </section>
  );
}

interface SponsorTierProps {
  tier: SponsorLogo['tier'];
  label: string;
  logos: readonly SponsorLogo[];
}

function SponsorTier({ tier, label, logos }: SponsorTierProps) {
  return (
    <div className={styles['cn-sponsor-tier']}>
      <div className="cn-style-f5af09c0">
        <span className="cn-style-3da7a6ce">{label}</span>
        <span className="cn-style-da577a08" />
      </div>
      <div className={`${styles['cn-sponsor-grid']} ${styles[`cn-sponsor-grid-${tier}`]}`} role="group" aria-label={label}>
        {logos.map((sponsor) => <SponsorLogo key={sponsor.id} sponsor={sponsor} />)}
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
        loading="lazy"
        className={styles['cn-sponsor-logo']}
      />
    </div>
  );
}

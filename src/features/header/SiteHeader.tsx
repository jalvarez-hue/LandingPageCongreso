import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  const [editionYears, setEditionYears] = useState<{
    published: number | null;
    draft: number | null;
  }>({ published: null, draft: null });

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const controller = new AbortController();
    const loadEditionYears = async () => {
      const { data, error } = await client
        .from('congress_editions')
        .select('year, status')
        .in('status', ['published', 'draft'])
        .order('year', { ascending: false })
        .abortSignal(controller.signal);

      if (controller.signal.aborted) return;
      if (error) {
        console.error('No fue posible cargar las ediciones del menú principal.', error);
        return;
      }

      setEditionYears({
        published: data.find((edition) => edition.status === 'published')?.year ?? null,
        draft: data.find((edition) => edition.status === 'draft')?.year ?? null,
      });
    };

    void loadEditionYears();
    return () => controller.abort();
  }, []);

  return (
    <>
      <a className="cn-skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className={`${styles.scope} cn-style-3627b8b9`}>
        <div className="cn-style-8ba1d008">
          <a href="#inicio" className="cn-style-aec8477d">
            <img
              src="/assets/f150ad1413ceb185dff1f5da66133803.png"
              alt="Congreso Nacional Aseguradoras y Hospitales · Sinergia de perspectivas"
              width="278"
              height="76"
              className="cn-style-bc4d7310"
            />
          </a>
          <nav aria-label="Principal" className="cn-style-eb65b16b">
            <a href="#paneles" className="cn-style-435e42ad">
              {editionYears.published === null ? 'Paneles' : `Paneles ${editionYears.published}`}
            </a>
            <a href="#patrocinadores" className="cn-style-435e42ad">Patrocinadores</a>
            <a href="#patrocinio" className="cn-style-38b4b987">
              {editionYears.draft === null ? 'Patrocina' : `Patrocina ${editionYears.draft}`}
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}

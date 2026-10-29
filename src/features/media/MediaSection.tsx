import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './MediaSection.module.css';

const mediaPartners = [
  {
    id: 'revista-siniestro',
    name: 'Revista Siniestro',
    src: '/assets/10bc17cef0d97ecd55684008e72be5c4.jpg',
    className: 'cn-style-5dbbc792',
  },
  {
    id: 'hudle',
    name: 'Hudle, estrategia de marca',
    src: '/assets/1d0ddaff8e872f266e2dcd9cb75ac27d.png',
    className: 'cn-style-38d79dfe',
  },
  {
    id: 'el-asegurador',
    name: 'El Asegurador',
    src: '/assets/49664b8cac45ec14d0fe1aa23e8245ab.jpg',
    className: 'cn-style-b0090d44',
  },
  {
    id: 'central-media',
    name: 'Central Media',
    src: '/assets/06a492bf5fb723c18a93432169067ff2.jpg',
    className: 'cn-style-114bb7fb',
  },
] as const;

export function MediaSection() {
  const [remoteMedia, setRemoteMedia] = useState<{ id: string; title: string | null; media_type: 'image' | 'video'; url: string; thumbnail_url: string | null; alt_text: string | null }[]>([]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const loadMedia = async () => {
      const { data, error } = await client
        .from('media_items')
        .select('id, title, media_type, url, thumbnail_url, alt_text, congress_editions!inner(status)')
        .eq('is_active', true)
        .eq('congress_editions.status', 'published')
        .order('display_order');
      if (error) {
        console.error('No fue posible cargar los medios de ediciones publicadas.', error);
        return;
      }

      setRemoteMedia((data ?? []) as typeof remoteMedia);
    };

    void loadMedia();
  }, []);

  return (
    <section id="medios" aria-labelledby="medios-title" className={`${styles.scope} cn-style-8b8d6142`}>
      <div className="cn-style-9314ad02">
        <div className="cn-style-f5af09c0">
          <h2 id="medios-title" className="cn-style-b648f652 cn-reset-heading">
            Medios aliados
          </h2>
          <span className="cn-style-da577a08" />
        </div>
        <div className="cn-style-3911d223">
          {remoteMedia.length > 0
            ? remoteMedia.map((item) => (
                <div key={item.id} className="cn-style-e6372759">
                  {item.media_type === 'video' ? (
                    <video src={item.url} poster={item.thumbnail_url ?? undefined} controls width="240" height="160" />
                  ) : (
                    <img src={item.url} alt={item.alt_text ?? item.title ?? 'Recurso multimedia del congreso'} loading="lazy" width="240" height="90" />
                  )}
                </div>
              ))
            : mediaPartners.map((partner) => (
                <div key={partner.id} className="cn-style-e6372759">
                  <img src={partner.src} alt={partner.name} loading="lazy" width="240" height="90" className={partner.className} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

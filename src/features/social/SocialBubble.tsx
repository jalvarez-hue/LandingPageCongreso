import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { reportApplicationError } from '../../lib/errorReporter';
import { parseSocialSettings } from './socialSettings';
import type { SocialSettings } from './socialSettings';
import styles from './SocialBubble.module.css';

function SocialIcon({ network }: { network: SocialSettings['network'] }) {
  if (network === 'whatsapp') {
    return <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
      <path d="M27 15a11 11 0 0 1-16 10L5 27l2-6A11 11 0 1 1 27 15Z" />
      <path d="M12 9c-2 2 0 6 3 9s6 4 8 2l-4-3-2 1-3-3 1-2-3-4Z" strokeLinejoin="round" />
    </svg>;
  }
  if (network === 'telegram') {
    return <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M27.6 5.2 23.8 26c-.3 1.5-1.2 1.8-2.5 1l-6.8-5-3.3 3.2c-.4.4-.7.7-1.4.7l.5-6.9L23 8.5c.6-.5-.1-.8-.9-.3L6.9 17.8l-6.6-2c-1.4-.4-1.4-1.4.3-2L25.9 4.1c1.2-.4 2.2.3 1.7 1.1Z" transform="translate(2 1)" />
    </svg>;
  }
  if (network === 'facebook') {
    return <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M18.4 29V17.4h3.9l.6-4.5h-4.5V10c0-1.3.4-2.2 2.2-2.2H23V3.7c-.4-.1-1.9-.2-3.6-.2-3.6 0-6 2.2-6 6.2v3.2h-4v4.5h4V29h5Z" />
    </svg>;
  }
  return <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M7.2 10.7H3.5V28h3.7V10.7ZM5.4 3.9a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM28.5 18.1c0-5.2-2.8-7.7-6.5-7.7a5.6 5.6 0 0 0-5 2.7v-2.4h-3.7V28H17v-8.6c0-2.3.4-4.5 3.3-4.5s2.9 2.6 2.9 4.7V28h3.7l1.6-9.9Z" />
  </svg>;
}

export function SocialBubble() {
  const [links, setLinks] = useState<SocialSettings[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const { data, error } = await client.from('social_links')
          .select('id, network, url, label, is_active, open_in_new_tab, display_order')
          .eq('is_active', true)
          .order('display_order')
          .order('id')
          .abortSignal(controller.signal);
        if (controller.signal.aborted) return;
        if (error) throw error;
        setLinks((data ?? []).map(parseSocialSettings));
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        console.error('No fue posible cargar los enlaces de redes sociales.', error);
        void reportApplicationError(error, 'social.load');
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  if (links.length === 0) return null;

  return (
    <div className={styles['cn-social-dock']}>
      <nav id="cn-social-links" className={styles['cn-social-list']} aria-label="Redes sociales" hidden={!isOpen}>
        {links.map((link) => (
          <a
            key={link.id}
            className={styles['cn-social-link']}
            href={link.url}
            target={link.open_in_new_tab ? '_blank' : undefined}
            rel={link.open_in_new_tab ? 'noopener noreferrer' : undefined}
            aria-label={`${link.label}${link.open_in_new_tab ? ' (abre en una pestaña nueva)' : ''}`}
          >
            <span>{link.label}</span>
            <span className={styles['cn-social-icon']}><SocialIcon network={link.network} /></span>
          </a>
        ))}
      </nav>
      <button
        type="button"
        className={styles['cn-social-toggle']}
        aria-label={isOpen ? 'Cerrar redes sociales' : 'Abrir redes sociales'}
        aria-expanded={isOpen}
        aria-controls="cn-social-links"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M12 5v14M5 12h14" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        )}
      </button>
    </div>
  );
}

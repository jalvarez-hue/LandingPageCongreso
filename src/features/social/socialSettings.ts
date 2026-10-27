export type SocialNetwork = 'whatsapp' | 'telegram' | 'facebook';

export interface SocialSettings {
  id: string;
  network: SocialNetwork;
  url: string;
  label: string;
  is_active: boolean;
  open_in_new_tab: boolean;
  display_order: number;
}

export function isWhatsAppUrl(value: string): boolean {
  if (value !== value.trim()) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return false;
    if (url.hostname === 'api.whatsapp.com' && url.pathname === '/send') {
      return /^[1-9]\d{6,14}$/.test(url.searchParams.get('phone') ?? '');
    }
    return url.hostname === 'wa.me' && /^\/[1-9]\d{6,14}$/.test(url.pathname);
  } catch (error: unknown) {
    if (error instanceof TypeError) return false;
    throw error;
  }
}

export function isSocialUrl(network: SocialNetwork, value: string): boolean {
  if (network === 'whatsapp') return isWhatsAppUrl(value);
  if (value !== value.trim()) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return false;
    if (network === 'telegram') {
      return ['t.me', 'telegram.me'].includes(url.hostname) &&
        url.pathname.length > 1 && !url.pathname.startsWith('//');
    }
    return ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.com', 'www.fb.com'].includes(url.hostname) &&
      url.pathname.length > 1 && !url.pathname.startsWith('//');
  } catch (error: unknown) {
    if (error instanceof TypeError) return false;
    throw error;
  }
}

export function isSocialNetwork(value: unknown): value is SocialNetwork {
  return value === 'whatsapp' || value === 'telegram' || value === 'facebook';
}

export function parseSocialSettings(value: unknown): SocialSettings {
  if (
    typeof value !== 'object' || value === null ||
    !('network' in value) || !isSocialNetwork(value.network) ||
    !('url' in value) || typeof value.url !== 'string' ||
    !('label' in value) || typeof value.label !== 'string' || !value.label.trim() ||
    !('is_active' in value) || typeof value.is_active !== 'boolean' ||
    !('open_in_new_tab' in value) || typeof value.open_in_new_tab !== 'boolean' ||
    !('display_order' in value) || typeof value.display_order !== 'number' || !Number.isInteger(value.display_order) ||
    !('id' in value) || typeof value.id !== 'string' || !value.id
  ) throw new Error('Configuración de red social inválida.');
  if (!/^https:\/\//i.test(value.url)) {
    throw new Error('El enlace de la red social debe usar HTTPS.');
  }
  if (value.is_active && !isSocialUrl(value.network, value.url)) {
    const instructions: Record<SocialNetwork, string> = {
      whatsapp: 'Captura un enlace HTTPS de WhatsApp con un número internacional válido, sin espacios ni signos.',
      telegram: 'Captura un enlace HTTPS de t.me o telegram.me.',
      facebook: 'Captura un enlace HTTPS de facebook.com o fb.com.',
    };
    throw new Error(instructions[value.network]);
  }
  return {
    id: value.id, network: value.network, url: value.url,
    label: value.label.trim(), is_active: value.is_active,
    open_in_new_tab: value.open_in_new_tab, display_order: value.display_order,
  };
}

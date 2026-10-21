export interface Panelist {
  name: string;
  role: string;
}

export interface CongressPanel {
  id: string;
  track: string;
  title: string;
  moderator: Panelist;
  panelists: readonly Panelist[];
}

export type EditionId = 'mer' | 'mty' | 'prox';

export interface Perspective {
  id: string;
  label: string;
  description: string;
  find: readonly string[];
  contribute: readonly string[];
}

export type SponsorshipLevel = 'Diamante' | 'Oro' | 'Plata' | 'Branding';

export type SponsorshipInterest = 'asistencia' | 'patrocinar' | '';

export interface SponsorshipSelection {
  interest: SponsorshipInterest;
  level: SponsorshipLevel | '';
}

export interface ContactFormValues {
  name: string;
  role: string;
  company: string;
  organization: string;
  email: string;
  message: string;
}

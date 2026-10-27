export type AdminSection = 'editions' | 'sponsors' | 'panels' | 'venues' | 'media' | 'messages' | 'errors' | 'settings';

export interface Edition {
  id: string;
  slug: string;
  year: number;
  city: string;
  venue_name: string | null;
  starts_on: string | null;
  ends_on: string | null;
  status: 'draft' | 'published' | 'archived';
}

export interface Tier {
  id: string;
  code: string;
  label: string;
}

export interface Sponsor {
  id: string;
  edition_id: string;
  tier_id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Panel {
  id: string;
  edition_id: string;
  track: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  display_order: number;
  is_published: boolean;
}

export interface PanelSpeaker {
  id: string;
  panel_id: string;
  name: string;
  role: string | null;
  bio: string | null;
  is_moderator: boolean;
  display_order: number;
}

export interface Venue {
  id: string;
  edition_id: string;
  name: string;
  address: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  video_label: string | null;
  google_maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
}

export interface VenueAmenity {
  id: string;
  edition_id: string;
  label: string;
  image_url: string | null;
  alt_text: string | null;
  display_order: number;
}

export interface MediaItem {
  id: string;
  edition_id: string | null;
  title: string | null;
  media_type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  category: 'archive' | 'media_partner' | 'gallery' | 'general';
  display_order: number;
  is_active: boolean;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  role: string | null;
  company: string;
  organization: string | null;
  email: string;
  interest: 'asistencia' | 'patrocinar' | null;
  sponsorship_tier_id: string | null;
  message: string | null;
  status: 'new' | 'read' | 'replied' | 'archived';
  internal_notes: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  context: string;
  message: string;
  stack: string | null;
  path: string | null;
  created_at: string;
}
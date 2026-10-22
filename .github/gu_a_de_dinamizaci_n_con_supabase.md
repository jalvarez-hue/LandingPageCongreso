# Guía de Dinamización de Módulos React con Supabase

Esta guía detalla la arquitectura, esquemas de base de datos SQL, clientes de integración y componentes dynamic/admin para los módulos:
1. **SponsorsSection.tsx**
2. **PanelsSection.tsx**
3. **VenueSection.tsx**
4. **MediaSection.tsx**
5. **ContactForm.tsx**

---

## 1. Análisis del DOM y Estructura de Datos (Data Modeling)

A partir del análisis del DOM típico para estos componentes en sitios de eventos/conferencias, se determinaron los siguientes campos requeridos:

*   **Sponsors (`sponsors`)**: Nombre del patrocinador, logo (URL), categoría (`Tier`: Diamond, Gold, Silver, Media Partner), enlace a sitio web, estado (activo) y orden de visualización.
*   **Panels / Paneles (`panels`)**: Título del panel, descripción, fecha/hora inicio y fin, ubicación o sala, estado y una relación de oradores/panelistas (`panel_speakers`).
*   **Venue / Sede (`venue_info`)**: Nombre de la sede, dirección, descripción, coordenadas (latitud/longitud), URL de Google Maps embed, foto principal y lista de amenidades o indicaciones (`amenities`).
*   **Media / Prensa (`media_gallery`)**: Título, tipo de recurso (`image` o `video`), URL del recurso, URL de miniatura, categoría y fecha.
*   **Contact Form (`contact_messages`)**: Nombre del remitente, email, asunto, mensaje, fecha de recepción, estado de lectura y notas internas.

---

## 2. Script de Base de Datos para Supabase (SQL)

Ejecuta el siguiente script en el SQL Editor de tu proyecto en Supabase para crear las tablas, índices y políticas de seguridad RLS (Row Level Security).

```sql
-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA SPONSORS
CREATE TABLE public.sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT,
    tier VARCHAR(50) NOT NULL DEFAULT 'Silver', -- Diamond, Gold, Silver, Partner
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA PANELES Y SPEAKERS
CREATE TABLE public.panels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.panel_speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(150),
    avatar_url TEXT,
    bio TEXT
);

-- 3. TABLA VENUE (SEDE)
CREATE TABLE public.venue_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    google_maps_url TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA MEDIA GALLERY
CREATE TABLE public.media_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA CONTACT MESSAGES
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SEGURIDAD (RLS)
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública (Para la Landing Page)
CREATE POLICY "Permitir lectura pública de sponsors" ON public.sponsors FOR SELECT USING (is_active = true);
CREATE POLICY "Permitir lectura pública de panels" ON public.panels FOR SELECT USING (is_published = true);
CREATE POLICY "Permitir lectura pública de panel_speakers" ON public.panel_speakers FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de venue_info" ON public.venue_info FOR SELECT USING (is_active = true);
CREATE POLICY "Permitir lectura pública de media" ON public.media_gallery FOR SELECT USING (true);

-- Política de Inserción para Formulario de Contacto
CREATE POLICY "Permitir inserción pública de mensajes" ON public.contact_messages FOR INSERT WITH CHECK (true);
```

---

## 3. Configuración del Cliente Supabase en React

Instala la dependencia:
```bash
npm install @supabase/supabase-js
```

Crea el archivo de cliente `src/lib/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 4. Implementación Dinámica de los Módulos

### 4.1 SponsorsSection.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  tier: string;
}

export const SponsorsSection: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) console.error('Error cargando sponsors:', error);
    else setSponsors(data || []);
    setLoading(false);
  };

  if (loading) return <div>Cargando Patrocinadores...</div>;

  const tiers = ['Diamond', 'Gold', 'Silver', 'Partner'];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Nuestros Patrocinadores</h2>
        {tiers.map((tier) => {
          const tierSponsors = sponsors.filter((s) => s.tier === tier);
          if (tierSponsors.length === 0) return null;

          return (
            <div key={tier} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">{tier}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
                {tierSponsors.map((sponsor) => (
                  <a
                    key={sponsor.id}
                    href={sponsor.website_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-white shadow rounded-lg hover:shadow-lg transition"
                  >
                    <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-20 mx-auto object-contain" />
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
```

### 4.2 PanelsSection.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Speaker {
  id: string;
  name: string;
  role: string;
  avatar_url: string;
}

interface Panel {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  panel_speakers: Speaker[];
}

export const PanelsSection: React.FC = () => {
  const [panels, setPanels] = useState<Panel[]>([]);

  useEffect(() => {
    fetchPanels();
  }, []);

  const fetchPanels = async () => {
    const { data, error } = await supabase
      .from('panels')
      .select(`
        *,
        panel_speakers (*)
      `)
      .eq('is_published', true)
      .order('start_time', { ascending: true });

    if (error) console.error('Error cargando paneles:', error);
    else setPanels(data || []);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Agenda y Paneles</h2>
        <div className="space-y-6">
          {panels.map((panel) => (
            <div key={panel.id} className="border rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <h3 className="text-2xl font-bold text-blue-600">{panel.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(panel.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                  {new Date(panel.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {panel.location}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{panel.description}</p>
              
              <div className="flex flex-wrap gap-4 mt-4">
                {panel.panel_speakers?.map((speaker) => (
                  <div key={speaker.id} className="flex items-center space-x-3 bg-gray-100 p-2 rounded-full pr-4">
                    <img src={speaker.avatar_url || '/default-avatar.png'} alt={speaker.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{speaker.name}</p>
                      <p className="text-xs text-gray-500">{speaker.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

### 4.3 VenueSection.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Venue {
  name: string;
  address: string;
  description: string;
  image_url: string;
  google_maps_url: string;
}

export const VenueSection: React.FC = () => {
  const [venue, setVenue] = useState<Venue | null>(null);

  useEffect(() => {
    const fetchVenue = async () => {
      const { data, error } = await supabase
        .from('venue_info')
        .select('*')
        .eq('is_active', true)
        .single();

      if (!error && data) setVenue(data);
    };
    fetchVenue();
  }, []);

  if (!venue) return null;

  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Ubicación y Sede</h2>
          <h3 className="text-xl font-semibold text-blue-600 mb-2">{venue.name}</h3>
          <p className="text-gray-600 mb-4">{venue.address}</p>
          <p className="text-gray-700 mb-6">{venue.description}</p>
          {venue.google_maps_url && (
            <a
              href={venue.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
            >
              Ver en Google Maps
            </a>
          )}
        </div>
        <div>
          <img src={venue.image_url} alt={venue.name} className="w-full h-80 object-cover rounded-lg shadow-md" />
        </div>
      </div>
    </section>
  );
};
```

### 4.4 MediaSection.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface MediaItem {
  id: string;
  title: string;
  media_type: 'image' | 'video';
  url: string;
  thumbnail_url: string;
}

export const MediaSection: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchMedia = async () => {
      const { data } = await supabase
        .from('media_gallery')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setMedia(data);
    };
    fetchMedia();
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Galería Multimedia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {media.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg shadow-md group">
              {item.media_type === 'image' ? (
                <img src={item.url} alt={item.title} className="w-full h-60 object-cover group-hover:scale-105 transition duration-300" />
              ) : (
                <video controls className="w-full h-60 object-cover">
                  <source src={item.url} type="video/mp4" />
                </video>
              )}
              {item.title && <p className="p-3 bg-gray-50 text-sm font-medium text-gray-700">{item.title}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

### 4.5 ContactForm.tsx

```tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({ full_name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const { error } = await supabase.from('contact_messages').insert([formData]);

    if (error) {
      console.error('Error al enviar mensaje:', error);
      setStatus('error');
    } else {
      setStatus('success');
      setFormData({ full_name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Contacto</h2>
        {status === 'success' && <p className="mb-4 p-3 bg-green-100 text-green-700 rounded">¡Mensaje enviado con éxito!</p>}
        {status === 'error' && <p className="mb-4 p-3 bg-red-100 text-red-700 rounded">Ocurrió un error. Intenta de nuevo.</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Asunto</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mensaje</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border rounded p-2"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>
      </div>
    </section>
  );
};
```

---

## 5. Panel/Formulario de Administración CRUD (Ejemplo SponsorAdmin.tsx)

Ejemplo de componente de gestión para subir e insertar nuevos patrocinadores a la base de datos:

```tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const SponsorAdmin: React.FC = () => {
  const [name, setName] = useState('');
  const [tier, setTier] = useState('Gold');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Selecciona un logo');

    setLoading(true);

    // 1. Subir archivo a Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `sponsors/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error subiendo imagen');
      setLoading(false);
      return;
    }

    // Obtener URL Pública
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    // 2. Insertar registro en BD
    const { error: insertError } = await supabase.from('sponsors').insert([
      {
        name,
        tier,
        website_url: websiteUrl,
        logo_url: publicUrlData.publicUrl,
      },
    ]);

    setLoading(false);
    if (insertError) alert('Error guardando en BD');
    else alert('Patrocinador guardado con éxito');
  };

  return (
    <form onSubmit={handleCreateSponsor} className="p-6 bg-white shadow rounded max-w-md">
      <h3 className="text-lg font-bold mb-4">Agregar Patrocinador</h3>
      <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mb-3 border p-2" />
      <select value={tier} onChange={(e) => setTier(e.target.value)} className="w-full mb-3 border p-2">
        <option value="Diamond">Diamond</option>
        <option value="Gold">Gold</option>
        <option value="Silver">Silver</option>
        <option value="Partner">Partner</option>
      </select>
      <input type="url" placeholder="Sitio Web" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="w-full mb-3 border p-2" />
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="w-full mb-3" />
      <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
};
```
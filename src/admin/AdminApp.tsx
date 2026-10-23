import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type {
  AdminSection,
  ContactMessage,
  Edition,
  MediaItem,
  Panel,
  PanelSpeaker,
  Sponsor,
  Tier,
  Venue,
} from './adminTypes';
import styles from './AdminApp.module.css';

const sections: { id: AdminSection; label: string }[] = [
  { id: 'sponsors', label: 'Patrocinadores' },
  { id: 'panels', label: 'Paneles' },
  { id: 'venues', label: 'Sedes' },
  { id: 'media', label: 'Medios' },
  { id: 'messages', label: 'Mensajes' },
];

export function AdminApp() {
  const [session, setSession] = useState<Awaited<ReturnType<NonNullable<typeof supabase>['auth']['getSession']>>['data']['session']>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<AdminSection>('sponsors');

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }

    void client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) return <AuthShell><ConfigNotice /></AuthShell>;
  if (loading) return <div className={styles.loading}>Cargando administración...</div>;
  if (!session) return <AuthShell><AuthForm /></AuthShell>;

  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <div>
          <span className={styles.kicker}>Congreso · Administración</span>
          <h1>Centro de contenidos</h1>
        </div>
        <div className={styles.account}>
          <span>{session.user.email}</span>
          <button type="button" className={styles.ghostButton} onClick={() => void supabase?.auth.signOut()}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <div className={styles.layout}>
        <nav className={styles.sidebar} aria-label="Secciones de administración">
          <span className={styles.navLabel}>Gestionar</span>
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? styles.navButtonActive : styles.navButton}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
          <a className={styles.backLink} href="/#contenido">Ver landing pública</a>
        </nav>
        <main className={styles.content}>
          {section === 'sponsors' && <SponsorsAdmin />}
          {section === 'panels' && <PanelsAdmin />}
          {section === 'venues' && <VenuesAdmin />}
          {section === 'media' && <MediaAdmin />}
          {section === 'messages' && <MessagesAdmin />}
        </main>
      </div>
    </div>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.authPage}>
      <div className={styles.authBrand}>
        <span className={styles.kicker}>Congreso · Backoffice</span>
        <h1>La conversación también se administra.</h1>
        <p>Gestiona el contenido que aparece en la landing desde un solo lugar.</p>
      </div>
      {children}
    </main>
  );
}

function ConfigNotice() {
  return (
    <section className={styles.authCard}>
      <h2>Falta configurar Supabase</h2>
      <p>Define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el entorno de Vite para activar el acceso administrativo.</p>
    </section>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setNotice('');
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/#admin` },
        });
    setSubmitting(false);
    if (result.error) {
      setNotice(result.error.message);
    } else if (mode === 'signup') {
      setNotice('Revisa tu correo para confirmar la cuenta antes de entrar.');
    }
  };

  return (
    <section className={styles.authCard}>
      <div className={styles.cardHeading}>
        <span className={styles.kicker}>Acceso seguro</span>
        <h2>{mode === 'login' ? 'Entrar al panel' : 'Crear cuenta'}</h2>
      </div>
      <form className={styles.form} onSubmit={submit}>
        <Field label="Correo electrónico">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        </Field>
        <Field label="Contraseña">
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </Field>
        {notice && <p className={styles.notice} role="status">{notice}</p>}
        <button className={styles.primaryButton} disabled={submitting} type="submit">
          {submitting ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Registrarme'}
        </button>
      </form>
      <button type="button" className={styles.textButton} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setNotice(''); }}>
        {mode === 'login' ? 'Necesito crear una cuenta' : 'Ya tengo una cuenta'}
      </button>
    </section>
  );
}

function SponsorsAdmin() {
  const [rows, setRows] = useState<Sponsor[]>([]);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [notice, setNotice] = useState('');
  const blank = { edition_id: '', tier_id: '', name: '', logo_url: '', website_url: '', display_order: '0', is_active: true };
  const [form, setForm] = useState(blank);

  const load = async () => {
    if (!supabase) return;
    const [sponsors, editionRows, tierRows] = await Promise.all([
      supabase.from('sponsors').select('*').order('display_order'),
      supabase.from('congress_editions').select('id, slug, year, city, status').order('year', { ascending: false }),
      supabase.from('sponsorship_tiers').select('id, code, label').eq('is_active', true).order('display_order'),
    ]);
    if (!sponsors.error) setRows((sponsors.data ?? []) as Sponsor[]);
    if (!editionRows.error) setEditions((editionRows.data ?? []) as Edition[]);
    if (!tierRows.error) setTiers((tierRows.data ?? []) as Tier[]);
  };
  useEffect(() => { void load(); }, []);

  const edit = (row: Sponsor) => { setEditing(row); setForm({ ...row, website_url: row.website_url ?? '', display_order: String(row.display_order) }); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    const payload = { ...form, display_order: Number(form.display_order), website_url: form.website_url || null };
    const result = editing
      ? await supabase.from('sponsors').update(payload).eq('id', editing.id)
      : await supabase.from('sponsors').insert(payload);
    if (result.error) setNotice(result.error.message);
    else { setNotice(editing ? 'Patrocinador actualizado.' : 'Patrocinador creado.'); setEditing(null); setForm(blank); void load(); }
  };
  const remove = async (id: string) => { if (supabase && window.confirm('¿Eliminar este patrocinador?')) { const result = await supabase.from('sponsors').delete().eq('id', id); setNotice(result.error?.message ?? 'Patrocinador eliminado.'); void load(); } };

  return <AdminSection title="Patrocinadores" description="Logos y marcas visibles por edición.">
    <EditorForm title={editing ? 'Editar patrocinador' : 'Agregar patrocinador'} onSubmit={submit} onCancel={() => { setEditing(null); setForm(blank); }} notice={notice}>
      <Field label="Nombre"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
      <div className={styles.formGrid}><Field label="Edición"><select value={form.edition_id} onChange={(event) => setForm({ ...form, edition_id: event.target.value })} required><option value="">Selecciona</option>{editions.map((item) => <option key={item.id} value={item.id}>{item.year} · {item.city}</option>)}</select></Field><Field label="Nivel"><select value={form.tier_id} onChange={(event) => setForm({ ...form, tier_id: event.target.value })} required><option value="">Selecciona</option>{tiers.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field></div>
      <Field label="URL del logo"><input type="url" value={form.logo_url} onChange={(event) => setForm({ ...form, logo_url: event.target.value })} required /></Field>
      <Field label="Sitio web"><input type="url" value={form.website_url} onChange={(event) => setForm({ ...form, website_url: event.target.value })} /></Field>
      <div className={styles.formGrid}><Field label="Orden"><input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} min="0" /></Field><label className={styles.check}><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Visible</label></div>
    </EditorForm>
    <DataTable columns={['Nombre', 'Nivel', 'Edición', 'Estado', 'Acciones']}>
      {rows.map((row) => <tr key={row.id}><td>{row.name}</td><td>{tiers.find((tier) => tier.id === row.tier_id)?.label ?? '—'}</td><td>{editions.find((edition) => edition.id === row.edition_id)?.city ?? '—'}</td><td>{row.is_active ? 'Visible' : 'Oculto'}</td><td><RowActions onEdit={() => edit(row)} onDelete={() => void remove(row.id)} /></td></tr>)}
    </DataTable>
  </AdminSection>;
}

function PanelsAdmin() {
  const blank = { edition_id: '', track: '', title: '', description: '', location: '', start_time: '', end_time: '', display_order: '0', is_published: true };
  const blankModerator = { name: '', role: '', description: '' };
  const blankPanelist = { name: '', role: '', description: '' };
  const [rows, setRows] = useState<Panel[]>([]);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [editing, setEditing] = useState<Panel | null>(null);
  const [form, setForm] = useState(blank);
  const [moderator, setModerator] = useState(blankModerator);
  const [panelists, setPanelists] = useState([blankPanelist]);
  const [notice, setNotice] = useState('');

  const load = async () => {
    if (!supabase) return;
    const [panels, editionsResult] = await Promise.all([
      supabase.from('panels').select('*').order('display_order'),
      supabase.from('congress_editions').select('id, slug, year, city, status').order('year', { ascending: false }),
    ]);
    if (!panels.error) setRows((panels.data ?? []) as Panel[]);
    if (!editionsResult.error) setEditions((editionsResult.data ?? []) as Edition[]);
  };

  useEffect(() => { void load(); }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(blank);
    setModerator(blankModerator);
    setPanelists([blankPanelist]);
  };

  const edit = async (row: Panel) => {
    if (!supabase) return;
    setEditing(row);
    setForm({
      edition_id: row.edition_id,
      track: row.track,
      title: row.title,
      description: row.description ?? '',
      location: row.location ?? '',
      start_time: row.start_time?.slice(0, 16) ?? '',
      end_time: row.end_time?.slice(0, 16) ?? '',
      display_order: String(row.display_order),
      is_published: row.is_published,
    });
    const result = await supabase
      .from('panel_speakers')
      .select('id, panel_id, name, role, bio, is_moderator, display_order')
      .eq('panel_id', row.id)
      .order('display_order');
    if (result.error) {
      setNotice(result.error.message);
      return;
    }
    const speakers = (result.data ?? []) as PanelSpeaker[];
    const moderatorSpeaker = speakers.find((speaker) => speaker.is_moderator);
    setModerator({ name: moderatorSpeaker?.name ?? '', role: moderatorSpeaker?.role ?? '', description: moderatorSpeaker?.bio ?? '' });
    setPanelists(speakers.filter((speaker) => !speaker.is_moderator).map((speaker) => ({ name: speaker.name, role: speaker.role ?? '', description: speaker.bio ?? '' })));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    const normalizedModerator = { name: moderator.name.trim(), role: moderator.role.trim(), description: moderator.description.trim() };
    const normalizedPanelists = panelists
      .map((panelist) => ({ name: panelist.name.trim(), role: panelist.role.trim(), description: panelist.description.trim() }))
      .filter((panelist) => panelist.name);
    if (!normalizedModerator.name) {
      setNotice('Captura el nombre del moderador.');
      return;
    }
    if (normalizedPanelists.length === 0) {
      setNotice('Agrega al menos un panelista.');
      return;
    }

    const payload = {
      ...form,
      display_order: Number(form.display_order),
      description: form.description || null,
      location: form.location || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
    };
    let panelId = editing?.id;
    if (editing) {
      const result = await supabase.from('panels').update(payload).eq('id', editing.id);
      if (result.error) {
        setNotice(result.error.message);
        return;
      }
    } else {
      const result = await supabase.from('panels').insert(payload).select('id').single();
      if (result.error) {
        setNotice(result.error.message);
        return;
      }
      panelId = result.data.id;
    }

    if (!panelId) return;
    const removeSpeakers = await supabase.from('panel_speakers').delete().eq('panel_id', panelId);
    if (removeSpeakers.error) {
      setNotice(removeSpeakers.error.message);
      return;
    }
    const speakerRows = [
      { panel_id: panelId, name: normalizedModerator.name, role: normalizedModerator.role || null, bio: normalizedModerator.description || null, is_moderator: true, display_order: 0 },
      ...normalizedPanelists.map((panelist, index) => ({ panel_id: panelId, name: panelist.name, role: panelist.role || null, bio: panelist.description || null, is_moderator: false, display_order: index + 1 })),
    ];
    const speakerResult = await supabase.from('panel_speakers').insert(speakerRows);
    if (speakerResult.error) {
      setNotice(speakerResult.error.message);
      return;
    }
    setNotice(editing ? 'Panel actualizado.' : 'Panel creado.');
    resetForm();
    void load();
  };

  const remove = async (id: string) => {
    if (supabase && window.confirm('¿Eliminar este panel?')) {
      const result = await supabase.from('panels').delete().eq('id', id);
      setNotice(result.error?.message ?? 'Panel eliminado.');
      void load();
    }
  };

  return <AdminSection title="Paneles" description="Agenda, temas, moderación y panelistas de cada sesión.">
    <EditorForm title={editing ? 'Editar panel' : 'Agregar panel'} onSubmit={submit} onCancel={resetForm} notice={notice}>
      <div className={styles.formGrid}>
        <Field label="Edición"><select value={form.edition_id} onChange={(event) => setForm({ ...form, edition_id: event.target.value })} required><option value="">Selecciona</option>{editions.map((item) => <option key={item.id} value={item.id}>{item.year} · {item.city}</option>)}</select></Field>
        <Field label="Track"><input value={form.track} onChange={(event) => setForm({ ...form, track: event.target.value })} required /></Field>
      </div>
      <Field label="Título"><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></Field>
      <Field label="Descripción"><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
      <div className={styles.formGrid}>
        <Field label="Sala"><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></Field>
        <Field label="Orden"><input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} /></Field>
      </div>
      <div className={styles.formGrid}>
        <Field label="Inicio"><input type="datetime-local" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} /></Field>
        <Field label="Fin"><input type="datetime-local" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} /></Field>
      </div>
      <div className={styles.speakerBlock}>
        <h4>Moderador</h4>
        <div className={styles.formGrid}>
          <Field label="Nombre del moderador"><input value={moderator.name} onChange={(event) => setModerator({ ...moderator, name: event.target.value })} required /></Field>
          <Field label="Cargo"><input value={moderator.role} onChange={(event) => setModerator({ ...moderator, role: event.target.value })} /></Field>
        </div>
        <Field label="Descripción"><textarea value={moderator.description} onChange={(event) => setModerator({ ...moderator, description: event.target.value })} /></Field>
      </div>
      <div className={styles.speakerBlock}>
        <div className={styles.speakerHeading}><h4>Panelistas</h4><button type="button" className={styles.smallButton} onClick={() => setPanelists([...panelists, blankPanelist])}>Agregar panelista</button></div>
        {panelists.map((panelist, index) => <div className={styles.speakerRow} key={`${index}-${panelist.name}`}><Field label={`Panelista ${index + 1}`}><input value={panelist.name} onChange={(event) => setPanelists(panelists.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} required={index === 0} /></Field><Field label="Cargo"><input value={panelist.role} onChange={(event) => setPanelists(panelists.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item))} /></Field><button type="button" className={styles.dangerButton} onClick={() => setPanelists(panelists.filter((_, itemIndex) => itemIndex !== index))} disabled={panelists.length === 1}>Quitar</button><div className={styles.speakerDescription}><Field label="Descripción"><textarea value={panelist.description} onChange={(event) => setPanelists(panelists.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} /></Field></div></div>)}
      </div>
      <label className={styles.check}><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} /> Publicado</label>
    </EditorForm>
    <DataTable columns={['Título', 'Track', 'Edición', 'Estado', 'Acciones']}>
      {rows.map((row) => <tr key={row.id}><td>{row.title}</td><td>{row.track}</td><td>{editions.find((edition) => edition.id === row.edition_id)?.city ?? '—'}</td><td>{row.is_published ? 'Publicado' : 'Borrador'}</td><td><RowActions onEdit={() => void edit(row)} onDelete={() => void remove(row.id)} /></td></tr>)}
    </DataTable>
  </AdminSection>;
}

function VenuesAdmin() {
  const blank = { edition_id: '', name: '', address: '', description: '', image_url: '', google_maps_url: '', latitude: '', longitude: '', is_active: true };
  const [rows, setRows] = useState<Venue[]>([]); const [editions, setEditions] = useState<Edition[]>([]); const [editing, setEditing] = useState<Venue | null>(null); const [form, setForm] = useState(blank); const [notice, setNotice] = useState('');
  const load = async () => { if (!supabase) return; const [venues, editionRows] = await Promise.all([supabase.from('venues').select('*').order('updated_at', { ascending: false }), supabase.from('congress_editions').select('id, slug, year, city, status').order('year', { ascending: false })]); if (!venues.error) setRows((venues.data ?? []) as Venue[]); if (!editionRows.error) setEditions((editionRows.data ?? []) as Edition[]); };
  useEffect(() => { void load(); }, []);
  const edit = (row: Venue) => { setEditing(row); setForm({ ...row, description: row.description ?? '', image_url: row.image_url ?? '', google_maps_url: row.google_maps_url ?? '', latitude: row.latitude?.toString() ?? '', longitude: row.longitude?.toString() ?? '' }); };
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!supabase) return; const payload = { ...form, description: form.description || null, image_url: form.image_url || null, google_maps_url: form.google_maps_url || null, latitude: form.latitude ? Number(form.latitude) : null, longitude: form.longitude ? Number(form.longitude) : null }; const result = editing ? await supabase.from('venues').update(payload).eq('id', editing.id) : await supabase.from('venues').insert(payload); if (result.error) setNotice(result.error.message); else { setNotice(editing ? 'Sede actualizada.' : 'Sede creada.'); setEditing(null); setForm(blank); void load(); } };
  const remove = async (id: string) => { if (supabase && window.confirm('¿Eliminar esta sede?')) { const result = await supabase.from('venues').delete().eq('id', id); setNotice(result.error?.message ?? 'Sede eliminada.'); void load(); } };
  return <AdminSection title="Sedes" description="Ubicación, imágenes y enlaces del evento."><EditorForm title={editing ? 'Editar sede' : 'Agregar sede'} onSubmit={submit} onCancel={() => { setEditing(null); setForm(blank); }} notice={notice}><div className={styles.formGrid}><Field label="Edición"><select value={form.edition_id} onChange={(event) => setForm({ ...form, edition_id: event.target.value })} required><option value="">Selecciona</option>{editions.map((item) => <option key={item.id} value={item.id}>{item.year} · {item.city}</option>)}</select></Field><Field label="Nombre"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field></div><Field label="Dirección"><input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required /></Field><Field label="Descripción"><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><Field label="Imagen URL"><input type="url" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} /></Field><Field label="Google Maps URL"><input type="url" value={form.google_maps_url} onChange={(event) => setForm({ ...form, google_maps_url: event.target.value })} /></Field><div className={styles.formGrid}><Field label="Latitud"><input type="number" step="any" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} /></Field><Field label="Longitud"><input type="number" step="any" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} /></Field></div><label className={styles.check}><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Activa</label></EditorForm><DataTable columns={['Nombre', 'Edición', 'Dirección', 'Estado', 'Acciones']}>{rows.map((row) => <tr key={row.id}><td>{row.name}</td><td>{editions.find((edition) => edition.id === row.edition_id)?.city ?? '—'}</td><td>{row.address}</td><td>{row.is_active ? 'Activa' : 'Oculta'}</td><td><RowActions onEdit={() => edit(row)} onDelete={() => void remove(row.id)} /></td></tr>)}</DataTable></AdminSection>;
}

function MediaAdmin() {
  const blank = { edition_id: '', title: '', media_type: 'image' as MediaItem['media_type'], url: '', thumbnail_url: '', alt_text: '', category: 'gallery' as MediaItem['category'], display_order: '0', is_active: true };
  const [rows, setRows] = useState<MediaItem[]>([]); const [editions, setEditions] = useState<Edition[]>([]); const [editing, setEditing] = useState<MediaItem | null>(null); const [form, setForm] = useState(blank); const [notice, setNotice] = useState('');
  const load = async () => { if (!supabase) return; const [media, editionRows] = await Promise.all([supabase.from('media_items').select('*').order('display_order'), supabase.from('congress_editions').select('id, slug, year, city, status').order('year', { ascending: false })]); if (!media.error) setRows((media.data ?? []) as MediaItem[]); if (!editionRows.error) setEditions((editionRows.data ?? []) as Edition[]); };
  useEffect(() => { void load(); }, []);
  const edit = (row: MediaItem) => { setEditing(row); setForm({ ...row, edition_id: row.edition_id ?? '', title: row.title ?? '', thumbnail_url: row.thumbnail_url ?? '', alt_text: row.alt_text ?? '', display_order: String(row.display_order) }); };
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!supabase) return; const payload = { ...form, edition_id: form.edition_id || null, title: form.title || null, thumbnail_url: form.thumbnail_url || null, alt_text: form.alt_text || null, display_order: Number(form.display_order) }; const result = editing ? await supabase.from('media_items').update(payload).eq('id', editing.id) : await supabase.from('media_items').insert(payload); if (result.error) setNotice(result.error.message); else { setNotice(editing ? 'Medio actualizado.' : 'Medio creado.'); setEditing(null); setForm(blank); void load(); } };
  const remove = async (id: string) => { if (supabase && window.confirm('¿Eliminar este medio?')) { const result = await supabase.from('media_items').delete().eq('id', id); setNotice(result.error?.message ?? 'Medio eliminado.'); void load(); } };
  return <AdminSection title="Medios" description="Fotos, videos y aliados de comunicación."><EditorForm title={editing ? 'Editar medio' : 'Agregar medio'} onSubmit={submit} onCancel={() => { setEditing(null); setForm(blank); }} notice={notice}><div className={styles.formGrid}><Field label="Tipo"><select value={form.media_type} onChange={(event) => setForm({ ...form, media_type: event.target.value as MediaItem['media_type'] })}><option value="image">Imagen</option><option value="video">Video</option></select></Field><Field label="Categoría"><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as MediaItem['category'] })}><option value="gallery">Galería</option><option value="archive">Archivo</option><option value="media_partner">Medio aliado</option><option value="general">General</option></select></Field></div><Field label="Edición"><select value={form.edition_id} onChange={(event) => setForm({ ...form, edition_id: event.target.value })}><option value="">Sin edición</option>{editions.map((item) => <option key={item.id} value={item.id}>{item.year} · {item.city}</option>)}</select></Field><Field label="Título"><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field><Field label="URL del recurso"><input type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} required /></Field><Field label="URL de miniatura"><input type="url" value={form.thumbnail_url} onChange={(event) => setForm({ ...form, thumbnail_url: event.target.value })} /></Field><Field label="Texto alternativo"><input value={form.alt_text} onChange={(event) => setForm({ ...form, alt_text: event.target.value })} /></Field><div className={styles.formGrid}><Field label="Orden"><input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} /></Field><label className={styles.check}><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Visible</label></div></EditorForm><DataTable columns={['Título', 'Tipo', 'Categoría', 'Estado', 'Acciones']}>{rows.map((row) => <tr key={row.id}><td>{row.title || 'Sin título'}</td><td>{row.media_type}</td><td>{row.category}</td><td>{row.is_active ? 'Visible' : 'Oculto'}</td><td><RowActions onEdit={() => edit(row)} onDelete={() => void remove(row.id)} /></td></tr>)}</DataTable></AdminSection>;
}

function MessagesAdmin() {
  const [rows, setRows] = useState<ContactMessage[]>([]); const [selected, setSelected] = useState<ContactMessage | null>(null); const [status, setStatus] = useState<ContactMessage['status']>('new'); const [notes, setNotes] = useState(''); const [, setNotice] = useState('');
  const load = async () => { if (!supabase) return; const result = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }); if (!result.error) setRows((result.data ?? []) as ContactMessage[]); else setNotice(result.error.message); };
  useEffect(() => { void load(); }, []);
  const select = (row: ContactMessage) => { setSelected(row); setStatus(row.status); setNotes(row.internal_notes ?? ''); };
  const save = async () => { if (!supabase || !selected) return; const result = await supabase.from('contact_messages').update({ status, internal_notes: notes, is_read: status !== 'new' }).eq('id', selected.id); setNotice(result.error?.message ?? 'Mensaje actualizado.'); if (!result.error) { setSelected(null); void load(); } };
  return <AdminSection title="Mensajes" description="Solicitudes recibidas desde el formulario de patrocinio."><DataTable columns={['Fecha', 'Contacto', 'Empresa', 'Interés', 'Estado', 'Acciones']}>{rows.map((row) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleDateString('es-MX')}</td><td><strong>{row.full_name}</strong><br /><span>{row.email}</span></td><td>{row.company}</td><td>{row.interest ?? '—'}</td><td>{row.status}</td><td><button type="button" className={styles.smallButton} onClick={() => select(row)}>Abrir</button></td></tr>)}</DataTable>{selected && <div className={styles.detailPanel}><div className={styles.detailHeader}><div><span className={styles.kicker}>Solicitud</span><h3>{selected.full_name} · {selected.company}</h3></div><button type="button" className={styles.ghostButton} onClick={() => setSelected(null)}>Cerrar</button></div><p><a href={`mailto:${selected.email}`}>{selected.email}</a> · {selected.role || 'Sin cargo'} · {selected.organization || 'Sin organización'}</p><p className={styles.message}>{selected.message || 'Sin mensaje adicional.'}</p><div className={styles.formGrid}><Field label="Estado"><select value={status} onChange={(event) => setStatus(event.target.value as ContactMessage['status'])}><option value="new">Nuevo</option><option value="read">Leído</option><option value="replied">Respondido</option><option value="archived">Archivado</option></select></Field><Field label="Notas internas"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></Field></div><button type="button" className={styles.primaryButton} onClick={() => void save()}>Guardar cambios</button></div>}</AdminSection>;
}

function AdminSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section><div className={styles.pageHeading}><div><span className={styles.kicker}>Contenido</span><h2>{title}</h2><p>{description}</p></div></div>{children}</section>;
}

function EditorForm({ title, onSubmit, onCancel, notice, children }: { title: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void; notice: string; children: ReactNode }) {
  return <section className={styles.editor}><div className={styles.editorHeader}><h3>{title}</h3>{notice && <span className={styles.notice}>{notice}</span>}</div><form className={styles.form} onSubmit={onSubmit}>{children}<div className={styles.formActions}><button type="submit" className={styles.primaryButton}>Guardar</button><button type="button" className={styles.ghostButton} onClick={onCancel}>Limpiar</button></div></form></section>;
}

function DataTable({ columns, children }: { columns: string[]; children: ReactNode }) {
  return <div className={styles.tableWrap}><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return <span className={styles.rowActions}><button type="button" className={styles.smallButton} onClick={onEdit}>Editar</button><button type="button" className={styles.dangerButton} onClick={onDelete}>Eliminar</button></span>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toGenericError } from '../lib/errorReporter';
import type {
  AdminSection,
  ContactMessage,
  Edition,
  ErrorLog,
  MediaItem,
  Panel,
  PanelSpeaker,
  Sponsor,
  Tier,
  Venue,
  VenueAmenity,
} from './adminTypes';
import styles from './AdminApp.module.css';

type ToastKind = 'success' | 'error';
type Toast = { message: string; kind: ToastKind } | null;
type ToastContextValue = { showToast: (message: string, kind: ToastKind) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
}

function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast>(null);
  const showToast = useCallback((message: string, kind: ToastKind) => setToast({ message, kind }), []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return <ToastContext.Provider value={{ showToast }}>
    {children}
    {toast && <div className={`${styles.toast} ${toast.kind === 'error' ? styles.toastError : styles.toastSuccess}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
      <strong>{toast.kind === 'error' ? 'Error' : 'Listo'}</strong>
      <span>{toast.message}</span>
      <button type="button" className={styles.toastClose} aria-label="Cerrar aviso" onClick={() => setToast(null)}>×</button>
    </div>}
  </ToastContext.Provider>;
}

const sections: { id: AdminSection; label: string }[] = [
  { id: 'editions', label: 'Ediciones' },
  { id: 'sponsors', label: 'Patrocinadores' },
  { id: 'panels', label: 'Paneles' },
  { id: 'venues', label: 'Sedes' },
  { id: 'media', label: 'Medios' },
  { id: 'messages', label: 'Mensajes' },
  { id: 'errors', label: 'Errores' },
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

  if (!supabase) return <ToastProvider><AuthShell><ConfigNotice /></AuthShell></ToastProvider>;
  if (loading) return <div className={styles.loading}>Cargando administración...</div>;
  if (!session) return <ToastProvider><AuthShell><AuthForm /></AuthShell></ToastProvider>;

  return (
    <ToastProvider>
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
          {section === 'editions' && <EditionsAdmin />}
          {section === 'sponsors' && <SponsorsAdmin />}
          {section === 'panels' && <PanelsAdmin />}
          {section === 'venues' && <><VenuesAdmin /><VenueAmenitiesAdmin /></>}
          {section === 'media' && <MediaAdmin />}
          {section === 'messages' && <MessagesAdmin />}
          {section === 'errors' && <ErrorsAdmin />}
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}

function EditionsAdmin() {
  const statuses: Edition['status'][] = ['draft', 'published', 'archived'];
  const blank = { slug: '', year: String(new Date().getFullYear()), city: '', venue_name: '', starts_on: '', ends_on: '', status: 'draft' as Edition['status'] };
  const [rows, setRows] = useState<Edition[]>([]);
  const [editing, setEditing] = useState<Edition | null>(null);
  const [form, setForm] = useState(blank);
  const [notice, setNotice] = useState('');
  const load = async () => {
    if (!supabase) return;
    const result = await supabase.from('congress_editions').select('id, slug, year, city, venue_name, starts_on, ends_on, status').order('year', { ascending: false });
    if (!result.error) setRows((result.data ?? []) as Edition[]);
    else setNotice(toGenericError(result.error, 'admin.editions.load'));
  };
  useEffect(() => { void load(); }, []);
  const edit = (row: Edition) => {
    setEditing(row);
    setForm({ slug: row.slug, year: String(row.year), city: row.city, venue_name: row.venue_name ?? '', starts_on: row.starts_on ?? '', ends_on: row.ends_on ?? '', status: row.status });
  };
  const availableStatuses = editing?.status === 'published' ? (['published', 'archived'] as Edition['status'][]) : statuses;
  const reset = () => { setEditing(null); setForm(blank); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    const payload = { ...form, year: Number(form.year), venue_name: form.venue_name || null, starts_on: form.starts_on || null, ends_on: form.ends_on || null };
    const result = editing
      ? await supabase.from('congress_editions').update(payload).eq('id', editing.id)
      : await supabase.from('congress_editions').insert(payload);
    if (result.error) setNotice(toGenericError(result.error, 'admin.editions.save'));
    else { setNotice(editing ? 'Edición actualizada.' : 'Edición creada.'); reset(); void load(); }
  };
  const remove = async (id: string) => {
    if (!supabase || !window.confirm('¿Eliminar esta edición?')) return;
    const result = await supabase.from('congress_editions').delete().eq('id', id);
    setNotice(result.error ? toGenericError(result.error, 'admin.editions.delete') : 'Edición eliminada.');
    if (!result.error) void load();
  };
  return <AdminSection title="Ediciones" description="Catálogo de ediciones que alimenta los demás módulos de contenido.">
    <EditorForm title={editing ? 'Editar edición' : 'Agregar edición'} onSubmit={submit} onCancel={reset} notice={notice}>
      <div className={styles.formGrid}><Field label="Slug"><input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="congreso-2027" required /></Field><Field label="Año"><input type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} min="2000" max="2100" required /></Field></div>
      <div className={styles.formGrid}><Field label="Ciudad"><input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required /></Field><Field label="Sede"><input value={form.venue_name} onChange={(event) => setForm({ ...form, venue_name: event.target.value })} /></Field></div>
      <div className={styles.formGrid}><Field label="Inicio"><input type="date" value={form.starts_on} onChange={(event) => setForm({ ...form, starts_on: event.target.value })} /></Field><Field label="Fin"><input type="date" value={form.ends_on} onChange={(event) => setForm({ ...form, ends_on: event.target.value })} /></Field></div>
      <Field label="Estatus"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Edition['status'] })}>{availableStatuses.map((status) => <option key={status} value={status} disabled={editing?.status === 'published' && status === 'published'}>{status}</option>)}</select></Field>
    </EditorForm>
    <DataTable columns={['Edición', 'Ciudad', 'Fechas', 'Estatus', 'Acciones']}>{rows.map((row) => <tr key={row.id}><td><strong>{row.year}</strong><br /><span>{row.slug}</span></td><td>{row.city}</td><td>{row.starts_on ?? '—'} a {row.ends_on ?? '—'}</td><td>{row.status}</td><td><RowActions onEdit={() => edit(row)} onDelete={() => void remove(row.id)} /></td></tr>)}</DataTable>
  </AdminSection>;
}

function ErrorsAdmin() {
  const [rows, setRows] = useState<ErrorLog[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [notice, setNotice] = useState('');

  const load = async (start = fromDate, end = toDate) => {
    if (!supabase) return;
    let query = supabase.from('app_errors').select('id, context, message, stack, path, created_at').order('created_at', { ascending: false });
    if (start) query = query.gte('created_at', `${start}T00:00:00.000Z`);
    if (end) {
      const endExclusive = new Date(`${end}T00:00:00.000Z`);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
      query = query.lt('created_at', endExclusive.toISOString());
    }
    const result = await query;
    if (!result.error) setRows((result.data ?? []) as ErrorLog[]);
    else setNotice(toGenericError(result.error, 'admin.errors.load'));
  };

  useEffect(() => { void load(); }, []);

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fromDate && toDate && fromDate > toDate) {
      setNotice('La fecha inicial debe ser menor o igual que la fecha final.');
      return;
    }
    void load();
  };

  const clear = () => {
    setFromDate('');
    setToDate('');
    setNotice('');
    void load('', '');
  };

  return <AdminSection title="Errores" description="Registro técnico de errores ocurridos en la aplicación.">
    <NoticeToast notice={notice} />
    <form className={styles.filterBar} onSubmit={search}>
      <Field label="Desde"><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></Field>
      <Field label="Hasta"><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></Field>
      <div className={styles.formActions}><button type="submit" className={styles.primaryButton}>Buscar</button><button type="button" className={styles.ghostButton} onClick={clear}>Limpiar</button></div>
    </form>
    <DataTable columns={['Fecha', 'Contexto', 'Ruta', 'Mensaje', 'Detalle']}>
      {rows.map((row) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleString('es-MX')}</td><td>{row.context}</td><td>{row.path ?? '—'}</td><td>{row.message}</td><td>{row.stack ? <details><summary>Ver stack</summary><pre className={styles.errorStack}>{row.stack}</pre></details> : '—'}</td></tr>)}
    </DataTable>
  </AdminSection>;
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
      setNotice(toGenericError(result.error, 'admin.auth'));
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
        <NoticeToast notice={notice} />
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
      supabase.from('congress_editions').select('id, slug, year, city, status').eq('status', 'draft').order('year', { ascending: false }),
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
    if (result.error) setNotice(toGenericError(result.error, 'admin.sponsors.save'));
    else { setNotice(editing ? 'Patrocinador actualizado.' : 'Patrocinador creado.'); setEditing(null); setForm(blank); void load(); }
  };
  const remove = async (id: string) => { if (supabase && window.confirm('¿Eliminar este patrocinador?')) { const result = await supabase.from('sponsors').delete().eq('id', id); setNotice(result.error ? toGenericError(result.error, 'admin.sponsors.delete') : 'Patrocinador eliminado.'); void load(); } };

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
      supabase.from('congress_editions').select('id, slug, year, city, status').eq('status', 'draft').order('year', { ascending: false }),
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
      setNotice(toGenericError(result.error, 'admin.panels.load-speakers'));
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
        setNotice(toGenericError(result.error, 'admin.panels.update'));
        return;
      }
    } else {
      const result = await supabase.from('panels').insert(payload).select('id').single();
      if (result.error) {
        setNotice(toGenericError(result.error, 'admin.panels.create'));
        return;
      }
      panelId = result.data.id;
    }

    if (!panelId) return;
    const removeSpeakers = await supabase.from('panel_speakers').delete().eq('panel_id', panelId);
    if (removeSpeakers.error) {
      setNotice(toGenericError(removeSpeakers.error, 'admin.panels.delete-speakers'));
      return;
    }
    const speakerRows = [
      { panel_id: panelId, name: normalizedModerator.name, role: normalizedModerator.role || null, bio: normalizedModerator.description || null, is_moderator: true, display_order: 0 },
      ...normalizedPanelists.map((panelist, index) => ({ panel_id: panelId, name: panelist.name, role: panelist.role || null, bio: panelist.description || null, is_moderator: false, display_order: index + 1 })),
    ];
    const speakerResult = await supabase.from('panel_speakers').insert(speakerRows);
    if (speakerResult.error) {
      setNotice(toGenericError(speakerResult.error, 'admin.panels.save-speakers'));
      return;
    }
    setNotice(editing ? 'Panel actualizado.' : 'Panel creado.');
    resetForm();
    void load();
  };

  const remove = async (id: string) => {
    if (supabase && window.confirm('¿Eliminar este panel?')) {
      const result = await supabase.from('panels').delete().eq('id', id);
      setNotice(result.error ? toGenericError(result.error, 'admin.panels.delete') : 'Panel eliminado.');
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
  const blank = { edition_id: '', name: '', address: '', description: '', image_url: '', video_url: '', video_label: '', google_maps_url: '', latitude: '', longitude: '', is_active: true };
  const [rows, setRows] = useState<Venue[]>([]);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [form, setForm] = useState(blank);
  const [notice, setNotice] = useState('');
  const load = async () => {
    if (!supabase) return;
    const [venues, editionRows] = await Promise.all([
      supabase.from('venues').select('*').order('updated_at', { ascending: false }),
      supabase.from('congress_editions').select('id, slug, year, city, status').order('year', { ascending: false }),
    ]);
    if (venues.error) setNotice(toGenericError(venues.error, 'admin.venues.load'));
    else setRows((venues.data ?? []) as Venue[]);
    if (editionRows.error) setNotice(toGenericError(editionRows.error, 'admin.venues.load-editions'));
    else setEditions((editionRows.data ?? []) as Edition[]);
  };
  useEffect(() => { void load(); }, []);
  const edit = (row: Venue) => {
    setEditing(row);
    setForm({
      edition_id: row.edition_id, name: row.name, address: row.address,
      description: row.description ?? '', image_url: row.image_url ?? '',
      video_url: row.video_url ?? '', video_label: row.video_label ?? '',
      google_maps_url: row.google_maps_url ?? '', latitude: row.latitude?.toString() ?? '',
      longitude: row.longitude?.toString() ?? '', is_active: row.is_active,
    });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    const payload = {
      ...form, description: form.description || null, image_url: form.image_url || null,
      video_url: form.video_url.trim() || null, video_label: form.video_label.trim() || null,
      google_maps_url: form.google_maps_url || null,
      latitude: form.latitude ? Number(form.latitude) : null, longitude: form.longitude ? Number(form.longitude) : null,
    };
    const result = editing ? await supabase.from('venues').update(payload).eq('id', editing.id) : await supabase.from('venues').insert(payload);
    if (result.error) setNotice(toGenericError(result.error, 'admin.venues.save'));
    else { setNotice(editing ? 'Sede actualizada.' : 'Sede creada.'); setEditing(null); setForm(blank); void load(); }
  };
  const remove = async (id: string) => { if (supabase && window.confirm('¿Eliminar esta sede?')) { const result = await supabase.from('venues').delete().eq('id', id); setNotice(result.error ? toGenericError(result.error, 'admin.venues.delete') : 'Sede eliminada.'); void load(); } };
  return <AdminSection title="Sedes" description="Ubicación y archivo de eventos. Las sedes activas de ediciones archivadas aparecen en Revivir Eventos.">
    <EditorForm title={editing ? 'Editar sede' : 'Agregar sede'} onSubmit={submit} onCancel={() => { setEditing(null); setForm(blank); }} notice={notice}>
      <div className={styles.formGrid}>
        <Field label="Edición"><select value={form.edition_id} onChange={(event) => setForm({ ...form, edition_id: event.target.value })} required><option value="">Selecciona</option>{editions.map((item) => <option key={item.id} value={item.id}>{item.year} · {item.city} ({item.status})</option>)}</select></Field>
        <Field label="Nombre"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
      </div>
      <Field label="Dirección (opcional para ediciones archivadas)"><input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required={editions.find((edition) => edition.id === form.edition_id)?.status !== 'archived'} /></Field>
      <Field label="Descripción"><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
      <Field label="URL de imagen / portada del video"><input value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} placeholder="https://… o /assets/imagen.jpg" /></Field>
      <Field label="URL del video del evento"><input value={form.video_url} onChange={(event) => setForm({ ...form, video_url: event.target.value })} placeholder="https://… o /assets/video.mp4" /></Field>
      <Field label="Etiqueta accesible del video"><input value={form.video_label} onChange={(event) => setForm({ ...form, video_label: event.target.value })} placeholder="Video de Mérida 2025" /></Field>
      <Field label="Google Maps URL"><input type="url" value={form.google_maps_url} onChange={(event) => setForm({ ...form, google_maps_url: event.target.value })} /></Field>
      <div className={styles.formGrid}>
        <Field label="Latitud"><input type="number" step="any" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} /></Field>
        <Field label="Longitud"><input type="number" step="any" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} /></Field>
      </div>
      <label className={styles.check}><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Activa</label>
    </EditorForm>
    <DataTable columns={['Nombre', 'Edición', 'Dirección', 'Estado', 'Acciones']}>{rows.map((row) => <tr key={row.id}><td>{row.name}</td><td>{editions.find((edition) => edition.id === row.edition_id)?.city ?? '—'}</td><td>{row.address}</td><td>{row.is_active ? 'Activa' : 'Oculta'}</td><td><RowActions onEdit={() => edit(row)} onDelete={() => void remove(row.id)} /></td></tr>)}</DataTable>
  </AdminSection>;
}

function VenueAmenitiesAdmin() {
  const blank = { edition_id: '', label: '', image_url: '', alt_text: '', display_order: '0' };
  const [rows, setRows] = useState<VenueAmenity[]>([]);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [editing, setEditing] = useState<VenueAmenity | null>(null);
  const [form, setForm] = useState(blank);
  const [notice, setNotice] = useState('');

  const load = async () => {
    if (!supabase) return;
    const [amenities, editionRows] = await Promise.all([
      supabase.from('venue_amenities').select('*').order('display_order'),
      supabase.from('congress_editions').select('id, slug, year, city, status').order('year', { ascending: false }),
    ]);
    if (!amenities.error) setRows((amenities.data ?? []) as VenueAmenity[]);
    else setNotice(toGenericError(amenities.error, 'admin.venue-amenities.load'));
    if (!editionRows.error) setEditions((editionRows.data ?? []) as Edition[]);
    else setNotice(toGenericError(editionRows.error, 'admin.venue-amenities.load-editions'));
  };

  useEffect(() => { void load(); }, []);
  const reset = () => { setEditing(null); setForm(blank); };
  const edit = (row: VenueAmenity) => { setEditing(row); setForm({ edition_id: row.edition_id, label: row.label, image_url: row.image_url ?? '', alt_text: row.alt_text ?? '', display_order: String(row.display_order) }); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    const payload = { ...form, image_url: form.image_url.trim() || null, alt_text: form.alt_text.trim() || null, display_order: Number(form.display_order) };
    const result = editing
      ? await supabase.from('venue_amenities').update(payload).eq('id', editing.id)
      : await supabase.from('venue_amenities').insert(payload);
    if (result.error) setNotice(toGenericError(result.error, 'admin.venue-amenities.save'));
    else { setNotice(editing ? 'Amenidad actualizada.' : 'Amenidad creada.'); reset(); void load(); }
  };
  const remove = async (id: string) => {
    if (!supabase || !window.confirm('¿Eliminar esta amenidad o foto de la edición?')) return;
    const result = await supabase.from('venue_amenities').delete().eq('id', id);
    setNotice(result.error ? toGenericError(result.error, 'admin.venue-amenities.delete') : 'Amenidad eliminada.');
    if (!result.error) void load();
  };

  return <AdminSection title="Amenidades y fotos de edición" description="Cada registro pertenece directamente a una edición, no a una sede. Sin imagen: amenidad. Con imagen: fotografía para Revivir Eventos.">
    <EditorForm title={editing ? 'Editar amenidad o foto' : 'Agregar amenidad o foto'} onSubmit={submit} onCancel={reset} notice={notice}>
      <div className={styles.formGrid}><Field label="Edición"><select value={form.edition_id} onChange={(event) => setForm({ ...form, edition_id: event.target.value })} required><option value="">Selecciona</option>{editions.map((edition) => <option key={edition.id} value={edition.id}>{edition.year} · {edition.city} ({edition.status})</option>)}</select></Field><Field label="Orden"><input type="number" min="0" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} /></Field></div>
      <Field label="Etiqueta"><input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} placeholder="Estacionamiento disponible" required /></Field>
      <Field label="URL de fotografía (opcional)"><input value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} placeholder="https://… o /assets/foto.jpg" /></Field>
      <Field label="Texto alternativo de la foto"><input value={form.alt_text} onChange={(event) => setForm({ ...form, alt_text: event.target.value })} placeholder="Si está vacío, se usa la etiqueta" /></Field>
    </EditorForm>
    <DataTable columns={['Etiqueta', 'Tipo', 'Edición', 'Orden', 'Acciones']}>{rows.map((row) => {
      const edition = editions.find((item) => item.id === row.edition_id);
      return <tr key={row.id}><td>{row.label}</td><td>{row.image_url ? 'Fotografía' : 'Amenidad'}</td><td>{edition ? `${edition.year} · ${edition.city}` : row.edition_id}</td><td>{row.display_order}</td><td><RowActions onEdit={() => edit(row)} onDelete={() => void remove(row.id)} /></td></tr>;
    })}</DataTable>
  </AdminSection>;
}

function MediaAdmin() {
  const blank = { edition_id: '', title: '', media_type: 'image' as MediaItem['media_type'], url: '', thumbnail_url: '', alt_text: '', category: 'gallery' as MediaItem['category'], display_order: '0', is_active: true };
  const [rows, setRows] = useState<MediaItem[]>([]); const [editions, setEditions] = useState<Edition[]>([]); const [editing, setEditing] = useState<MediaItem | null>(null); const [form, setForm] = useState(blank); const [notice, setNotice] = useState('');
  const load = async () => { if (!supabase) return; const [media, editionRows] = await Promise.all([supabase.from('media_items').select('*').order('display_order'), supabase.from('congress_editions').select('id, slug, year, city, status').eq('status', 'draft').order('year', { ascending: false })]); if (!media.error) setRows((media.data ?? []) as MediaItem[]); if (!editionRows.error) setEditions((editionRows.data ?? []) as Edition[]); };
  useEffect(() => { void load(); }, []);
  const edit = (row: MediaItem) => { setEditing(row); setForm({ ...row, edition_id: row.edition_id ?? '', title: row.title ?? '', thumbnail_url: row.thumbnail_url ?? '', alt_text: row.alt_text ?? '', display_order: String(row.display_order) }); };
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!supabase) return; const payload = { ...form, edition_id: form.edition_id || null, title: form.title || null, thumbnail_url: form.thumbnail_url || null, alt_text: form.alt_text || null, display_order: Number(form.display_order) }; const result = editing ? await supabase.from('media_items').update(payload).eq('id', editing.id) : await supabase.from('media_items').insert(payload); if (result.error) setNotice(toGenericError(result.error, 'admin.media.save')); else { setNotice(editing ? 'Medio actualizado.' : 'Medio creado.'); setEditing(null); setForm(blank); void load(); } };
  const remove = async (id: string) => { if (supabase && window.confirm('¿Eliminar este medio?')) { const result = await supabase.from('media_items').delete().eq('id', id); setNotice(result.error ? toGenericError(result.error, 'admin.media.delete') : 'Medio eliminado.'); void load(); } };
  return <AdminSection title="Medios" description="Fotos, videos y aliados de comunicación."><EditorForm title={editing ? 'Editar medio' : 'Agregar medio'} onSubmit={submit} onCancel={() => { setEditing(null); setForm(blank); }} notice={notice}><div className={styles.formGrid}><Field label="Tipo"><select value={form.media_type} onChange={(event) => setForm({ ...form, media_type: event.target.value as MediaItem['media_type'] })}><option value="image">Imagen</option><option value="video">Video</option></select></Field><Field label="Categoría"><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as MediaItem['category'] })}><option value="gallery">Galería</option><option value="archive">Archivo</option><option value="media_partner">Medio aliado</option><option value="general">General</option></select></Field></div><Field label="Edición"><select value={form.edition_id} onChange={(event) => setForm({ ...form, edition_id: event.target.value })}><option value="">Sin edición</option>{editions.map((item) => <option key={item.id} value={item.id}>{item.year} · {item.city}</option>)}</select></Field><Field label="Título"><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field><Field label="URL del recurso"><input type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} required /></Field><Field label="URL de miniatura"><input type="url" value={form.thumbnail_url} onChange={(event) => setForm({ ...form, thumbnail_url: event.target.value })} /></Field><Field label="Texto alternativo"><input value={form.alt_text} onChange={(event) => setForm({ ...form, alt_text: event.target.value })} /></Field><div className={styles.formGrid}><Field label="Orden"><input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} /></Field><label className={styles.check}><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Visible</label></div></EditorForm><DataTable columns={['Título', 'Tipo', 'Categoría', 'Estado', 'Acciones']}>{rows.map((row) => <tr key={row.id}><td>{row.title || 'Sin título'}</td><td>{row.media_type}</td><td>{row.category}</td><td>{row.is_active ? 'Visible' : 'Oculto'}</td><td><RowActions onEdit={() => edit(row)} onDelete={() => void remove(row.id)} /></td></tr>)}</DataTable></AdminSection>;
}

function MessagesAdmin() {
  const [rows, setRows] = useState<ContactMessage[]>([]); const [selected, setSelected] = useState<ContactMessage | null>(null); const [status, setStatus] = useState<ContactMessage['status']>('new'); const [notes, setNotes] = useState(''); const [notice, setNotice] = useState('');
  const load = async () => { if (!supabase) return; const result = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }); if (!result.error) setRows((result.data ?? []) as ContactMessage[]); else setNotice(toGenericError(result.error, 'admin.messages.load')); };
  useEffect(() => { void load(); }, []);
  const select = (row: ContactMessage) => { setSelected(row); setStatus(row.status); setNotes(row.internal_notes ?? ''); };
  const save = async () => { if (!supabase || !selected) return; const result = await supabase.from('contact_messages').update({ status, internal_notes: notes, is_read: status !== 'new' }).eq('id', selected.id); setNotice(result.error ? toGenericError(result.error, 'admin.messages.update') : 'Mensaje actualizado.'); if (!result.error) { setSelected(null); void load(); } };
  return <AdminSection title="Mensajes" description="Solicitudes recibidas desde el formulario de patrocinio."><NoticeToast notice={notice} /><DataTable columns={['Fecha', 'Contacto', 'Empresa', 'Interés', 'Estado', 'Acciones']}>{rows.map((row) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleDateString('es-MX')}</td><td><strong>{row.full_name}</strong><br /><span>{row.email}</span></td><td>{row.company}</td><td>{row.interest ?? '—'}</td><td>{row.status}</td><td><button type="button" className={styles.smallButton} onClick={() => select(row)}>Abrir</button></td></tr>)}</DataTable>{selected && <div className={styles.detailPanel}><div className={styles.detailHeader}><div><span className={styles.kicker}>Solicitud</span><h3>{selected.full_name} · {selected.company}</h3></div><button type="button" className={styles.ghostButton} onClick={() => setSelected(null)}>Cerrar</button></div><p><a href={`mailto:${selected.email}`}>{selected.email}</a> · {selected.role || 'Sin cargo'} · {selected.organization || 'Sin organización'}</p><p className={styles.message}>{selected.message || 'Sin mensaje adicional.'}</p><div className={styles.formGrid}><Field label="Estado"><select value={status} onChange={(event) => setStatus(event.target.value as ContactMessage['status'])}><option value="new">Nuevo</option><option value="read">Leído</option><option value="replied">Respondido</option><option value="archived">Archivado</option></select></Field><Field label="Notas internas"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></Field></div><button type="button" className={styles.primaryButton} onClick={() => void save()}>Guardar cambios</button></div>}</AdminSection>;
}

function AdminSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section><div className={styles.pageHeading}><div><span className={styles.kicker}>Contenido</span><h2>{title}</h2><p>{description}</p></div></div>{children}</section>;
}

function EditorForm({ title, onSubmit, onCancel, notice, children }: { title: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void; notice: string; children: ReactNode }) {
  return <section className={styles.editor}><NoticeToast notice={notice} /><div className={styles.editorHeader}><h3>{title}</h3>{notice && <span className={styles.notice}>{notice}</span>}</div><form className={styles.form} onSubmit={onSubmit}>{children}<div className={styles.formActions}><button type="submit" className={styles.primaryButton}>Guardar</button><button type="button" className={styles.ghostButton} onClick={onCancel}>Limpiar</button></div></form></section>;
}

function NoticeToast({ notice }: { notice: string }) {
  const { showToast } = useToast();
  useEffect(() => {
    if (!notice) return;
    const isError = /error|violat|duplicate|permission|invalid|no se|captura|agrega|solo puede|not null/i.test(notice);
    showToast(notice, isError ? 'error' : 'success');
  }, [notice, showToast]);
  return null;
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

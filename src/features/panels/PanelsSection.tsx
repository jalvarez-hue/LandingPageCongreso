import { useEffect, useState } from 'react';
import type { KeyboardEvent, CSSProperties } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { CongressPanel } from '../../types/congress';
import styles from './PanelsSection.module.css';

type EditionOption = {
  id: string;
  label: string;
  year: number;
  status: 'draft' | 'published' | 'archived';
};

export function PanelsSection() {
  const [editionId, setEditionId] = useState('');
  const [selectedPanelId, setSelectedPanelId] = useState('');
  const [editions, setEditions] = useState<readonly EditionOption[]>([]);
  const [remotePanels, setRemotePanels] = useState<Readonly<Record<string, readonly CongressPanel[]>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const panels = remotePanels[editionId] ?? [];
  const selectedEdition = editions.find((edition) => edition.id === editionId);
  const selectedPanel =
    panels.find((panel) => panel.id === selectedPanelId) ?? panels[0];

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setIsLoading(false);
      return;
    }

    const loadPanels = async () => {
      const [editionsResult, panelsResult] = await Promise.all([
        client.from('congress_editions').select('id, year, city, status').order('year', { ascending: false }),
        client
          .from('panels')
          .select('id, edition_id, track, title, display_order, panel_speakers(id, name, role, is_moderator, display_order)')
          .eq('is_published', true)
          .order('display_order'),
      ]);
      if (editionsResult.error || panelsResult.error) {
        setIsLoading(false);
        return;
      }

      const remoteEditions = editionsResult.data as {
        id: string;
        year: number;
        city: string;
        status: EditionOption['status'];
      }[];
      const availableEditions = remoteEditions
        .slice(0, 3)
        .map((edition) => ({
          id: edition.id,
          label: `${edition.city} ${edition.year}`,
          year: edition.year,
          status: edition.status,
        }))
        .sort((left, right) => left.year - right.year);
      setEditions(availableEditions);

      const editionById = new Map(
        availableEditions.map((edition) => [edition.id, edition]),
      );
      const mapped: Record<string, CongressPanel[]> = {};
      for (const panel of panelsResult.data as {
        id: string;
        edition_id: string;
        track: string;
        title: string;
        display_order: number;
        panel_speakers: { id: string; name: string; role: string | null; is_moderator: boolean; display_order: number }[];
      }[]) {
        const edition = editionById.get(panel.edition_id);
        if (!edition || edition.status === 'draft') continue;
        const moderator = panel.panel_speakers.find((speaker) => speaker.is_moderator) ?? panel.panel_speakers[0];
        const panelists = panel.panel_speakers.filter((speaker) => speaker.id !== moderator?.id);
        const mappedPanel: CongressPanel = {
          id: panel.id,
          display_order: panel.display_order,
          track: panel.track,
          title: panel.title,
          moderator: { name: moderator?.name ?? 'Por confirmar', role: moderator?.role ?? 'Moderación por confirmar' },
          panelists: panelists.map((speaker) => ({ name: speaker.name, role: speaker.role ?? 'Panelista' })),
        };
        mapped[edition.id] = [...(mapped[edition.id] ?? []), mappedPanel];
      }
      setRemotePanels(mapped);
      const activeEdition =
        [...availableEditions].reverse().find((edition) => edition.status === 'published') ??
        availableEditions[availableEditions.length - 1];
      const firstPanel = activeEdition ? mapped[activeEdition.id]?.[0] : undefined;
      setEditionId(activeEdition?.id ?? '');
      if (firstPanel) setSelectedPanelId(firstPanel.id);
      setIsLoading(false);
    };

    void loadPanels();
  }, []);

  const selectEdition = (id: string) => {
    setEditionId(id);
    const firstPanel = remotePanels[id]?.[0];
    if (firstPanel) {
      setSelectedPanelId(firstPanel.id);
    } else {
      setSelectedPanelId('');
    }
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (editions.length === 0) return;
    const currentIndex = editions.findIndex((edition) => edition.id === editionId);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % editions.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + editions.length) % editions.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = editions.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextEdition = editions[nextIndex];
    selectEdition(nextEdition.id);
    document.getElementById(`edition-tab-${nextEdition.id}`)?.focus();
  };

  return (
    <section id="paneles" aria-labelledby="paneles-title" className={`${styles.scope} cn-style-c124e542`}>
      <div className="cn-style-5b2d6575">
        <div className="cn-style-6f010eb3">
          <div className="cn-style-99e0d306">
            <div className="cn-style-bdd32329">Paneles anteriores</div>
            <h2 id="paneles-title" className="cn-style-5aecaaa6">De esto ya se habló</h2>
          </div>
          <div role="tablist" aria-label="Edición" className="cn-style-cb0a5620">
            {editions.map((edition) => {
              const selected = edition.id === editionId;
              const style: CSSProperties = {
                backgroundColor: selected ? 'var(--cn-color-lime)' : 'transparent',
                color: selected ? 'var(--cn-color-deep)' : 'var(--cn-color-white)',
              };

              return (
                <button
                  key={edition.id}
                  id={`edition-tab-${edition.id}`}
                  type="button"
                  role="tab"
                  aria-controls="edicion-panel"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectEdition(edition.id)}
                  onKeyDown={onTabKeyDown}
                  style={style}
                  className="cn-style-55c02f16"
                >
                  {edition.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="edicion-panel"
          role="tabpanel"
          aria-labelledby={`edition-tab-${editionId}`}
        >
          {isLoading ? (
            <div className="cn-style-d77cd510">
              <span className="cn-style-acffba63">Cargando paneles...</span>
            </div>
          ) : selectedEdition?.status === 'draft' ? (
            <div className="cn-style-d77cd510">
              <span className="cn-style-bdd32329">{selectedEdition.label}</span>
              <span className="cn-style-acffba63">Próximamente</span>
              <p className="cn-style-6c62e7ce">
                Muy pronto anunciaremos los paneles y temas de esta edición.
              </p>
              <a href="#patrocinio" className="cn-style-d60b5c98">Quiero ser parte</a>
            </div>
          ) : panels.length > 0 ? (
            <div className="cn-style-e271afea">
              <div className="cn-style-8cc054d6">
                {panels.map((panel) => {
                  const selected = panel.id === selectedPanel?.id;
                  const style: CSSProperties = {
                    backgroundColor: selected ? 'var(--cn-color-lime)' : 'transparent',
                    color: selected ? 'var(--cn-color-deep)' : 'var(--cn-color-white)',
                  };

                  return (
                    <button
                      key={panel.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedPanelId(panel.id)}
                      style={style}
                      className="cn-style-e2f16d24"
                    >
                      <span className="cn-style-948f1a7b">
                        {String((panel.display_order ?? panels.indexOf(panel)) + 1).padStart(2, '0')}
                      </span>
                      <span className="cn-style-a8eb6a4e">{panel.title}</span>
                    </button>
                  );
                })}
              </div>
              {selectedPanel && (
                <article className="cn-style-41bd1529">
                  <div className="cn-style-e10b33e8">
                    <span className="cn-style-bdc918fa">{selectedPanel.track}</span>
                    <span className="cn-style-f9eb89cc">
                      {`Panel ${panels.indexOf(selectedPanel) + 1} · ${selectedEdition?.label ?? ''}`}
                    </span>
                  </div>
                  <h3 className="cn-style-9deacf69">{selectedPanel.title}</h3>
                  <div className="cn-style-db5ec7f9">
                    <span className="cn-style-f9eb89cc">Moderación</span>
                    <span className="cn-style-584892a0">
                      <span className="cn-style-40ce4436">{selectedPanel.moderator.name}</span>
                      <span className="cn-style-e662d2a7">{selectedPanel.moderator.role}</span>
                    </span>
                  </div>
                  <div className="cn-style-38c72c3b">
                    <span className="cn-style-f9eb89cc">Panelistas</span>
                    <ul className="cn-style-8765d793">
                      {selectedPanel.panelists.map((panelist) => (
                        <li
                          key={`${panelist.name}-${panelist.role}`}
                          className="cn-style-3aba26e7"
                        >
                          <span className="cn-style-08852d4d">{panelist.name}</span>
                          <span className="cn-style-f720d2cf">{panelist.role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              )}
            </div>
          ) : (
            <div className="cn-style-d77cd510">
              <span className="cn-style-bdd32329">{selectedEdition?.label ?? 'Paneles'}</span>
              <span className="cn-style-acffba63">Sin paneles disponibles</span>
              <p className="cn-style-6c62e7ce">
                No hay paneles publicados para esta edición.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { editions, panelsByEdition } from '../../data/panels';
import { supabase } from '../../lib/supabaseClient';
import type { CongressPanel, EditionId } from '../../types/congress';
import styles from './PanelsSection.module.css';

export function PanelsSection() {
  const [editionId, setEditionId] = useState<EditionId>('mty');
  const [selectedPanelId, setSelectedPanelId] = useState(panelsByEdition.mty[0].id);
  const [remotePanels, setRemotePanels] = useState<Partial<Record<EditionId, readonly CongressPanel[]>>>({});
  const panels = editionId === 'prox'
    ? []
    : remotePanels[editionId] ?? panelsByEdition[editionId];
  const selectedPanel =
    panels.find((panel) => panel.id === selectedPanelId) ?? panels[0];

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const loadPanels = async () => {
      const [editionsResult, panelsResult] = await Promise.all([
        client.from('congress_editions').select('id, slug'),
        client.from('panels').select('id, edition_id, track, title, panel_speakers(id, name, role, is_moderator, display_order)').eq('is_published', true).order('display_order'),
      ]);
      if (editionsResult.error || panelsResult.error) return;

      const editionIds = new Map(
        (editionsResult.data as { id: string; slug: string }[]).map((edition) => [edition.id, edition.slug]),
      );
      const mapped: Partial<Record<EditionId, CongressPanel[]>> = {};
      for (const panel of panelsResult.data as { id: string; edition_id: string; track: string; title: string; panel_speakers: { id: string; name: string; role: string | null; is_moderator: boolean; display_order: number }[] }[]) {
        const slug = editionIds.get(panel.edition_id);
        const targetEdition = slug?.startsWith('mer-') ? 'mer' : slug?.startsWith('mty-') ? 'mty' : slug?.startsWith('prox-') ? 'prox' : undefined;
        if (!targetEdition) continue;
        const moderator = panel.panel_speakers.find((speaker) => speaker.is_moderator) ?? panel.panel_speakers[0];
        const panelists = panel.panel_speakers.filter((speaker) => speaker.id !== moderator?.id);
        const mappedPanel: CongressPanel = {
          id: panel.id,
          track: panel.track,
          title: panel.title,
          moderator: { name: moderator?.name ?? 'Por confirmar', role: moderator?.role ?? 'Moderación por confirmar' },
          panelists: panelists.map((speaker) => ({ name: speaker.name, role: speaker.role ?? 'Panelista' })),
        };
        mapped[targetEdition] = [...(mapped[targetEdition] ?? []), mappedPanel];
      }
      setRemotePanels(mapped);
      const firstPanel = mapped.mty?.[0];
      if (firstPanel) setSelectedPanelId(firstPanel.id);
    };

    void loadPanels();
  }, []);

  const selectEdition = (id: EditionId) => {
    setEditionId(id);
    const firstPanel = remotePanels[id]?.[0] ?? (id === 'prox' ? undefined : panelsByEdition[id][0]);
    if (firstPanel) {
      setSelectedPanelId(firstPanel.id);
    }
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
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
          {panels.length > 0 ? (
            <div className="cn-style-e271afea">
              <div className="cn-style-8cc054d6">
                {panels.map((panel) => {
                  const selected = panel.id === selectedPanel?.id;

                  return (
                    <button
                      key={panel.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedPanelId(panel.id)}
                      className="cn-style-e2f16d24"
                    >
                      <span className="cn-style-948f1a7b">{panel.id}</span>
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
                      {`Panel ${panels.indexOf(selectedPanel) + 1} · ${editionId === 'mer' ? 'Mérida 2025' : 'Monterrey 2026'}`}
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
              <span className="cn-style-bdd32329">
                3ª edición · Guadalajara · 1 al 4 de septiembre 2027
              </span>
              <span className="cn-style-acffba63">Próximamente</span>
              <p className="cn-style-6c62e7ce">
                Muy pronto anunciaremos los paneles y temas de la próxima edición.
              </p>
              <a href="#patrocinio" className="cn-style-d60b5c98">Quiero ser parte</a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

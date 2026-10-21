import { useState } from 'react';
import type { KeyboardEvent, CSSProperties } from 'react';
import { perspectives } from '../../data/perspectives';
import styles from './PerspectivesSection.module.css';

export function PerspectivesSection() {
  const [activePerspectiveId, setActivePerspectiveId] = useState<string>(perspectives[0].id);
  const activePerspective =
    perspectives.find((perspective) => perspective.id === activePerspectiveId) ?? perspectives[0];

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = perspectives.findIndex(
      (perspective) => perspective.id === activePerspectiveId,
    );
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % perspectives.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + perspectives.length) % perspectives.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = perspectives.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextPerspective = perspectives[nextIndex];
    setActivePerspectiveId(nextPerspective.id);
    document.getElementById(`perspective-tab-${nextPerspective.id}`)?.focus();
  };

  return (
    <section
      id="perspectivas"
      aria-labelledby="perspectivas-title"
      className={`${styles.scope} cn-style-dca551f6`}
    >
      <img
        className="cn-deco cn-style-8b16ca5b"
        src="/assets/05e12f4339967198cd5239d30c2f0fe0.png"
        alt=""
        aria-hidden="true"
        width="220"
        height="220"
        loading="lazy"
      />
      <div className="cn-style-42f1635b">
        <div className="cn-style-5a28d3ec">
          <div className="cn-style-b648f652">DIFERENTES PERSPECTIVAS</div>
          <h2 id="perspectivas-title" className="cn-style-2f394490">
            Encuentra tu lugar
            <br />
            en la comunidad.
          </h2>
          <a href="#patrocinio" className="cn-style-704f6d81">
            Sé parte del evento <span aria-hidden="true">→</span>
          </a>
        </div>
        <div role="tablist" aria-label="Perfiles" className="cn-style-db7b0f39">
          {perspectives.map((perspective) => {
            const isSelected = perspective.id === activePerspectiveId;
            const style: CSSProperties = {
              borderColor: isSelected ? 'var(--cn-color-green-dark)' : 'var(--cn-color-border-subtle)',
              backgroundColor: isSelected ? 'var(--cn-color-green-dark)' : 'var(--cn-color-white)',
              color: isSelected ? 'var(--cn-color-white)' : 'var(--cn-color-forest)',
            };

            return (
              <button
                key={perspective.id}
                id={`perspective-tab-${perspective.id}`}
                type="button"
                role="tab"
                aria-controls="perfil-panel"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActivePerspectiveId(perspective.id)}
                onKeyDown={onTabKeyDown}
                style={style}
                className="cn-style-2f08ab02"
              >
                {perspective.label}
              </button>
            );
          })}
        </div>
        <div
          id="perfil-panel"
          role="tabpanel"
          aria-labelledby={`perspective-tab-${activePerspective.id}`}
          className="cn-style-b433c5d0"
        >
          <div className="cn-style-ff35b930">
            <h3 className="cn-style-f54dc2ac">{activePerspective.label}</h3>
            <p className="cn-style-19792d10">{activePerspective.description}</p>
          </div>
          <div className="cn-style-1752f292">
            <div className="cn-style-ef15258e">Lo que encuentras</div>
            <ul className="cn-style-9f671676">
              {activePerspective.find.map((item) => (
                <li key={item} className="cn-style-f619de8d">
                  <span aria-hidden="true" className="cn-style-aba2357e">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cn-style-bbc408fd">
            <div className="cn-style-ef15258e">Lo que aportas</div>
            <ul className="cn-style-9f671676">
              {activePerspective.contribute.map((item) => (
                <li key={item} className="cn-style-f619de8d">
                  <span aria-hidden="true" className="cn-style-aba2357e">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

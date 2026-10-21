import { useState } from 'react';
import { perspectives } from '../../data';
import styles from './Perspectives.module.css';

export function Perspectives() { const [active, setActive] = useState(0); const perspective = perspectives[active]; return <section className={styles.section} id="perspectivas"><div className={styles.container}><p className={styles.kicker}>Diferentes perspectivas</p><h2>Encuentra tu lugar<br />en la comunidad.</h2><div className={styles.tabs} role="tablist" aria-label="Perfiles de la comunidad">{perspectives.map((item, index) => <button type="button" role="tab" aria-selected={active === index} className={active === index ? styles.active : ''} onClick={() => setActive(index)} key={item.label}>{item.label}</button>)}</div><div className={styles.panel} role="tabpanel"><div className={styles.intro}><h3>{perspective.label}</h3><p>{perspective.description}</p></div><List title="Lo que encuentras" items={perspective.finds} /><List title="Lo que aportas" items={perspective.contributes} /></div></div></section>; }

function List({ title, items }: { title: string; items: string[] }) { return <div className={styles.list}><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>; }

import { stats } from '../../data';
import styles from './Stats.module.css';

export function Stats() { return <section className={styles.stats} aria-labelledby="stats-title"><h2 id="stats-title">La historia crece día a día</h2><div className={styles.grid}>{stats.map((stat) => <div className={styles.stat} key={stat.label}><strong>{stat.value}+</strong><span>{stat.label}</span></div>)}</div></section>; }

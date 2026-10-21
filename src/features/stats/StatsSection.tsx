import { useAnimatedStats } from '../../hooks/useAnimatedStats';
import styles from './StatsSection.module.css';

const statistics = [
  { id: 'voices', value: 147, prefix: '+', label: 'Voces del sector' },
  { id: 'insurers', value: 14, prefix: '', label: 'Aseguradoras' },
  { id: 'hospitals', value: 85, prefix: '+', label: 'Hospitales' },
  { id: 'sponsors', value: 35, prefix: '', label: 'Patrocinadores' },
] as const;

export function StatsSection() {
  const progress = useAnimatedStats('cifras');

  return (
    <section id="cifras" aria-labelledby="cifras-title" className={`${styles.scope} cn-style-7e578401`}>
      <div className="cn-style-07604428">
        <h2 id="cifras-title" className="cn-style-c66ffaf6">La historia crece día a día</h2>
      </div>
      <div className="cn-style-bf50c224">
        {statistics.map((stat) => (
          <div key={stat.id} className="cn-style-d11a8b80">
            <span className="cn-style-210ded48">
              {stat.prefix}{Math.round(stat.value * progress)}
            </span>
            <span className="cn-style-c3be7a81">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

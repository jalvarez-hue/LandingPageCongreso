import { sponsorshipLevels } from '../../data/perspectives';
import type { SponsorshipSelection } from '../../types/congress';
import styles from './SponsorshipLevels.module.css';

interface SponsorshipLevelsProps {
  onSelect: (selection: SponsorshipSelection) => void;
}

export function SponsorshipLevels({ onSelect }: SponsorshipLevelsProps) {
  return (
    <section id="espacios" aria-labelledby="espacios-title" className={`${styles.scope} cn-style-63a9f820`}>
      <div className="cn-style-08808b1c">
        <div className="cn-style-6f010eb3">
          <div className="cn-style-99e0d306">
            <div className="cn-style-49e389f0">Espacios de patrocinio 2027</div>
            <h2 id="espacios-title" className="cn-style-5249e7dc">Tipos de patrocinio</h2>
          </div>
          <a href="#patrocinio" className="cn-style-caace99d">
            Quiero patrocinar <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="cn-style-3911d223">
          {sponsorshipLevels.map((level, index) => (
            <a
              key={level.id}
              href="#patrocinio"
              onClick={() => onSelect({ interest: 'patrocinar', level: level.id })}
              className={`cn-tier ${levelCardClasses[index]}`}
            >
              <span className="cn-style-a6dd71fc">
                <span className={levelLabelClasses[index]}>Patrocinador</span>
                <span className="cn-style-8de11d88">{level.id}</span>
                <span className={levelDescriptionClasses[index]}>{level.description}</span>
              </span>
              <span className={levelActionClasses[index]}>
                Me interesa <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const levelCardClasses = [
  'cn-style-51bf7864',
  'cn-style-88c09544',
  'cn-style-2f43849e',
  'cn-style-3c587d3c',
] as const;

const levelLabelClasses = [
  'cn-style-bdd32329',
  'cn-style-3da7a6ce',
  'cn-style-bdd32329',
  'cn-style-4d5b84f1',
] as const;

const levelDescriptionClasses = [
  'cn-style-87c80235',
  'cn-style-74afe33f',
  'cn-style-e7b02322',
  'cn-style-bbd09e6b',
] as const;

const levelActionClasses = [
  'cn-style-ea7c7464',
  'cn-style-05c4b353',
  'cn-style-f1238d02',
  'cn-style-8014d6f8',
] as const;

import { useEffect, useState } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { supabase } from '../../lib/supabaseClient';
import { toGenericError } from '../../lib/errorReporter';
import { formatEditionDates, getCountdownTarget } from './countdown';
import styles from './VenueSection.module.css';

type DraftEdition = {
  id: string;
  year: number;
  city: string;
  starts_on: string | null;
  ends_on: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDraftEdition(value: unknown): value is DraftEdition {
  return isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.year === 'number' && Number.isInteger(value.year) &&
    typeof value.city === 'string' &&
    (value.starts_on === null || typeof value.starts_on === 'string') &&
    (value.ends_on === null || typeof value.ends_on === 'string');
}

export function VenueSection() {
  const [draftEdition, setDraftEdition] = useState<DraftEdition | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const countdownTarget = getCountdownTarget(draftEdition?.starts_on ?? null);
  const time = useCountdown(countdownTarget ?? 0);
  const digits = [
    { id: 'days', value: time.days, label: 'Días' },
    { id: 'hours', value: time.hours, label: 'Horas' },
    { id: 'minutes', value: time.minutes, label: 'Minutos' },
    { id: 'seconds', value: time.seconds, label: 'Segundos' },
  ] as const;

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setIsLoaded(true);
      setErrorMessage('No fue posible cargar la fecha de la próxima edición.');
      return;
    }

    const controller = new AbortController();
    const loadSection = async () => {
      try {
        const editionResult = await client.from('congress_editions')
          .select('id, year, city, starts_on, ends_on')
          .eq('status', 'draft')
          .order('year', { ascending: false })
          .limit(1)
          .abortSignal(controller.signal)
          .maybeSingle();
        if (controller.signal.aborted) return;
        if (editionResult.error) throw editionResult.error;
        if (editionResult.data) {
          if (!isDraftEdition(editionResult.data)) throw new Error('Los datos de la próxima edición no son válidos.');
          setDraftEdition(editionResult.data);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) setErrorMessage(toGenericError(error, 'venue.load'));
      } finally {
        if (!controller.signal.aborted) setIsLoaded(true);
      }
    };
    void loadSection();
    return () => controller.abort();
  }, []);

  if (errorMessage) return <p role="alert">{errorMessage}</p>;
  if (!isLoaded) return <p role="status">Cargando fecha de la próxima edición…</p>;
  if (!draftEdition) return null;

  return (
    <section className={styles.section} aria-labelledby="upcoming-title">
      <div className={styles.countdownContent}>
        <div className={styles.countdownIntro}>
          <span className={styles.eyebrow}>Edición {draftEdition.year}</span>
          <h2 id="upcoming-title" className={styles.countdownTitle}>
            Nos vemos en <span>{draftEdition.city}</span>
          </h2>
          <p className={styles.description}>
            La próxima edición será {formatEditionDates(draftEdition.starts_on, draftEdition.ends_on, draftEdition.year)} en{' '}
            {draftEdition.city}. Esto es lo que falta para encontrarnos.
          </p>
          </div>
        {countdownTarget === null ? (
          <p className={styles.dateNotice}>La fecha de inicio está por confirmar.</p>
        ) : time.complete ? (
          <p className={styles.dateNotice} role="status">¡La edición {draftEdition.year} ya comenzó!</p>
        ) : (
          <div className={styles.countdown} role="timer" aria-label={`Cuenta regresiva para la edición ${draftEdition.year} en ${draftEdition.city}`}>
            {digits.map((digit, index) => (
              <div key={digit.id} className={styles.digitGroup}>
                <div className={index === 0 ? styles.digitCardDays : styles.digitCard}>
                  <span className={styles.digitValue}>{index === 0 ? digit.value : String(digit.value).padStart(2, '0')}</span>
                </div>
                <span className={styles.digitLabel}>{digit.label}</span>
              </div>
            ))}
            </div>
        )}
      </div>
    </section>
  );
}

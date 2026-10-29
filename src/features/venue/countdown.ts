const mexicoCentralOffset = '-06:00';

function parseDate(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(`${date}T12:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date ? null : parsed;
}

export function getCountdownTarget(startsOn: string | null): number | null {
  if (!startsOn || !parseDate(startsOn)) return null;
  const timestamp = new Date(`${startsOn}T00:00:00${mexicoCentralOffset}`).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function formatEditionDates(startsOn: string | null, endsOn: string | null, year: number): string {
  const start = startsOn ? parseDate(startsOn) : null;
  const end = endsOn ? parseDate(endsOn) : null;
  if ((startsOn && !start) || (endsOn && !end) || (start && end && end < start)) {
    return `con fechas por confirmar en ${year}`;
  }
  if (!start && !end) return `con fechas por confirmar en ${year}`;

  const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('es-MX', { ...options, timeZone: 'UTC' }).format(date);
  const singleDate = start ?? end;
  if (!singleDate) return `con fechas por confirmar en ${year}`;
  if (!start || !end || startsOn === endsOn) {
    return `el ${formatDate(singleDate, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }

  const sameMonth = startsOn?.slice(0, 7) === endsOn?.slice(0, 7);
  const startText = formatDate(start, sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'long' });
  const endText = formatDate(end, { day: 'numeric', month: 'long', year: 'numeric' });
  return `del ${startText} al ${endText}`;
}

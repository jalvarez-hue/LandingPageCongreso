import { useEffect, useState } from 'react';

export interface CountdownValue { days: number; hours: number; minutes: number; seconds: number; complete: boolean; }

const target = new Date('2027-09-01T00:00:00-06:00').getTime();

export function useCountdown(): CountdownValue {
  const calculate = (): CountdownValue => {
    const remaining = Math.max(0, target - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    return { days: Math.floor(totalSeconds / 86400), hours: Math.floor((totalSeconds % 86400) / 3600), minutes: Math.floor((totalSeconds % 3600) / 60), seconds: totalSeconds % 60, complete: remaining === 0 };
  };
  const [value, setValue] = useState<CountdownValue>(calculate);
  useEffect(() => { const timer = window.setInterval(() => setValue(calculate()), 1000); return () => window.clearInterval(timer); }, []);
  return value;
}

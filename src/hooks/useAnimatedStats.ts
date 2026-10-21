import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export function useAnimatedStats(elementId: string): number {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      return;
    }

    const element = document.getElementById(elementId);
    if (!element) {
      return;
    }

    let animationFrame = 0;
    let startedAt: number | undefined;
    let hasStarted = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted) {
          return;
        }

        hasStarted = true;
        const animate = (now: number) => {
          startedAt ??= now;
          const amount = Math.min(1, (now - startedAt) / 6_000);
          setProgress(1 - Math.pow(1 - amount, 3));

          if (amount < 1) {
            animationFrame = window.requestAnimationFrame(animate);
          }
        };

        animationFrame = window.requestAnimationFrame(animate);
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [elementId, reducedMotion]);

  return progress;
}

import { useState, useEffect } from 'react';

/**
 * Unified Client & Success Stats Source
 *
 * Base count: 731
 * Base anchor date: 2026-10-30T00:00:00Z
 * Increases by +1 every 3 days in the background automatically from this unified source.
 */
const BASE_COUNT = 731;
const ANCHOR_DATE = new Date('2026-10-30T00:00:00Z').getTime();
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_INCREMENT = 3;

export function getClientCount() {
  const now = Date.now();
  const diffDays = Math.floor((now - ANCHOR_DATE) / MS_PER_DAY);
  const increment = diffDays > 0 ? Math.floor(diffDays / DAYS_PER_INCREMENT) : 0;
  return BASE_COUNT + increment;
}

export function getClientCountFormatted(suffix = '+') {
  return `${getClientCount()}${suffix}`;
}

export function useClientCount() {
  const [count, setCount] = useState(getClientCount);

  useEffect(() => {
    // Recalculate on window focus or periodically (every hour)
    const update = () => setCount(getClientCount());
    window.addEventListener('focus', update);
    const interval = setInterval(update, 60 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', update);
      clearInterval(interval);
    };
  }, []);

  return count;
}


import { LEVELS } from '../theme';

export const fmtNumber = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'k';
  return String(n);
};

export const getLevel = (signedCount) =>
  LEVELS.find((l) => signedCount >= l.min && signedCount <= l.max) || LEVELS[0];

export const getNextLevel = (currentLevel) => {
  const idx = LEVELS.findIndex((l) => l.level === currentLevel.level);
  return idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
};

// Streaks from the contributions map ({ 'YYYY-MM-DD': signCount }).
// The current streak survives through today even if today has no signs yet —
// it only breaks once a full day is missed.
export const computeStreaks = (contributions = {}) => {
  const dayKey = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toISOString().slice(0, 10);
  };

  let current = 0;
  const todayCount = contributions[dayKey(0)] || 0;
  let offset = todayCount > 0 ? 0 : 1;
  while ((contributions[dayKey(offset)] || 0) > 0) {
    current += 1;
    offset += 1;
  }

  let best = 0;
  let run = 0;
  const days = Object.keys(contributions).sort();
  let prev = null;
  days.forEach((day) => {
    const active = (contributions[day] || 0) > 0;
    if (!active) { run = 0; prev = day; return; }
    const consecutive = prev && (new Date(day) - new Date(prev) === 86400000);
    run = consecutive && run > 0 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  });

  return { current, best: Math.max(best, current) };
};

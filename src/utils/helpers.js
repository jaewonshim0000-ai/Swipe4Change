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

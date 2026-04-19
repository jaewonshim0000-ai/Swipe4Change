// Design tokens from the architecture doc §10.1 (dark mode, blue/green accents)
export const COLORS = {
  // Surfaces
  surface: '#0f131e',
  surfaceLow: '#171b27',
  surfaceContainer: '#1b1f2b',
  surfaceHigh: '#262a36',
  surfaceHighest: '#313441',
  surfaceLowest: '#0a0e19',

  // On-surface
  onSurface: '#dfe2f2',
  onSurfaceVariant: '#c3c6d5',
  onSurfaceMuted: 'rgba(255,255,255,0.5)',
  onSurfaceDim: 'rgba(255,255,255,0.4)',
  onSurfaceFaint: 'rgba(255,255,255,0.1)',

  // Brand
  primary: '#b1c5ff',
  primaryContainer: '#5c8cfb',
  primaryDeep: '#1b58c5',

  // Accents
  tertiary: '#4edea3',
  tertiaryContainer: '#00a572',
  onTertiary: '#003824',

  // States
  error: '#ffb4ab',
  errorContainer: '#93000a',
  success: '#4edea3',

  // Border/outline
  outline: 'rgba(255,255,255,0.1)',
  outlineStrong: 'rgba(255,255,255,0.2)',

  // Pure
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// Per-category gradients and glows used on petition cards
export const CATEGORY_STYLE = {
  Climate:        { from: '#0b4d44', to: '#06a77d', glow: '#4edea3', icon: 'leaf' },
  'Human Rights': { from: '#4a1f1f', to: '#c04646', glow: '#ff8a8a', icon: 'scale-balance' },
  Education:      { from: '#2a1e5f', to: '#7c5cff', glow: '#b1c5ff', icon: 'school' },
  Privacy:        { from: '#0f2a4a', to: '#2e7dd1', glow: '#8cbcff', icon: 'shield-check' },
  Housing:        { from: '#3a2410', to: '#c27a2e', glow: '#ffb57a', icon: 'home-variant' },
  Health:         { from: '#2a0f3d', to: '#a84ec9', glow: '#e5a9ff', icon: 'heart-pulse' },
  Wildlife:       { from: '#3a2a05', to: '#d6a527', glow: '#ffd975', icon: 'paw' },
  Ocean:          { from: '#051f3d', to: '#1b6fc9', glow: '#7fb8ff', icon: 'waves' },
};

// Gamification levels from §8.1
export const LEVELS = [
  { level: 1, name: 'Observer',    min: 0,   max: 5,    color: '#94a3b8' },
  { level: 2, name: 'Supporter',   min: 6,   max: 20,   color: '#60a5fa' },
  { level: 3, name: 'Advocate',    min: 21,  max: 50,   color: '#a78bfa' },
  { level: 4, name: 'Changemaker', min: 51,  max: 100,  color: '#f472b6' },
  { level: 5, name: 'Catalyst',    min: 101, max: 9999, color: '#fbbf24' },
];

export const RADII = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

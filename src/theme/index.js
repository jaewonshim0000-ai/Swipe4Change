// Design tokens taken from the Swipe4Change design. Every value here appears
// literally in `Swipe4Change.dc.html`.
export const COLORS = {
  // Surfaces
  surface: '#0a0e19',
  surfaceDeep: '#05070d',
  surfaceCard: '#0d1220',
  surfaceLow: '#0f1524',
  surfaceContainer: '#121828',
  surfaceHigh: '#1a2133',
  surfaceHighest: '#232c42',
  surfaceLowest: '#05070d',
  // Sheet gradient stops
  sheetTop: '#141a29',
  sheetBottom: '#0d1220',
  // Avatar / tile gradient stops
  tileTop: '#243049',
  tileBottom: '#131a2a',

  // On-surface
  onSurface: '#dfe2f2',
  onSurfaceVariant: '#c3c6d5',

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
  onError: '#690005',
  errorContainer: '#93000a',
  reportRed: 'rgba(186,26,26,.9)',
  success: '#4edea3',

  amber: '#fbbf24',
  orange: '#f97316',
  violet: '#a78bfa',
  blue: '#60a5fa',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// The design's three families. Serif carries display type, mono carries every
// micro-label and numeral, sans carries body copy.
export const FONTS = {
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemi: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  sansBlack: 'PlusJakartaSans_800ExtraBold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
};

// The design's type ramp — it only ever uses these sizes.
export const SIZE = { xs: 9, sm: 11, md: 13, lg: 17, xl: 24, xxl: 32, display: 40 };

// Ambient radial glows behind every screen. React Native has no radial
// gradient, so each is drawn as an oversized circular linear gradient.
export const AMBIENT_GLOWS = [
  { colors: ['rgba(92,140,251,0.20)', 'rgba(92,140,251,0)'], size: 560, top: -170, left: -120 },
  { colors: ['rgba(78,222,163,0.13)', 'rgba(78,222,163,0)'], size: 520, top: 150, right: -190 },
  { colors: ['rgba(27,88,197,0.16)', 'rgba(27,88,197,0)'], size: 700, bottom: -300, left: -80 },
];

// Frosted chrome recipe (glass pills, tab bar, sheets).
export const GLASS = {
  fill: 'rgba(12,17,28,0.42)',
  fillStrong: 'rgba(13,17,28,0.72)',
  border: 'rgba(255,255,255,0.20)',
  borderSoft: 'rgba(255,255,255,0.09)',
  highlight: 'rgba(255,255,255,0.18)',
  blur: 16,
};

// Uppercase mono micro-label, the design's primary annotation style.
export const monoLabel = (size = 9, color = 'rgba(255,255,255,.4)', spacing = 1.9) => ({
  fontFamily: FONTS.mono,
  fontSize: size,
  letterSpacing: spacing,
  color,
});

// Section heading above each block: mono 9px / 1.9 tracking, 24 above, 12 below.
export const SECTION_LABEL = {
  fontFamily: FONTS.mono,
  fontSize: 9,
  letterSpacing: 1.9,
  color: 'rgba(255,255,255,.4)',
  marginTop: 24,
  marginBottom: 12,
};

// Per-category gradient, glow, icon and UN goal — the design's `CAT` map.
export const CATEGORY_STYLE = {
  Climate: { from: '#0b4d44', to: '#06a77d', glow: '#4edea3', icon: 'eco', sdg: { n: 13, name: 'Climate Action', color: '#3F7E44' } },
  'Human Rights': { from: '#4a1f1f', to: '#c04646', glow: '#ff8a8a', icon: 'balance', sdg: { n: 10, name: 'Reduced Inequalities', color: '#DD1367' } },
  Education: { from: '#2a1e5f', to: '#7c5cff', glow: '#b1c5ff', icon: 'school', sdg: { n: 4, name: 'Quality Education', color: '#C5192D' } },
  Privacy: { from: '#0f2a4a', to: '#2e7dd1', glow: '#8cbcff', icon: 'shield', sdg: { n: 16, name: 'Peace & Justice', color: '#00689D' } },
  Housing: { from: '#3a2410', to: '#c27a2e', glow: '#ffb57a', icon: 'home', sdg: { n: 11, name: 'Sustainable Cities', color: '#FD9D24' } },
  Health: { from: '#2a0f3d', to: '#a84ec9', glow: '#e5a9ff', icon: 'monitor_heart', sdg: { n: 3, name: 'Good Health & Well-Being', color: '#4C9F38' } },
  Wildlife: { from: '#3a2a05', to: '#d6a527', glow: '#ffd975', icon: 'pets', sdg: { n: 15, name: 'Life on Land', color: '#56C02B' } },
  Ocean: { from: '#051f3d', to: '#1b6fc9', glow: '#7fb8ff', icon: 'waves', sdg: { n: 14, name: 'Life Below Water', color: '#0A97D9' } },
};

// Long-form category names, used on the onboarding cards.
export const CATEGORY_LABEL = {
  Climate: 'Climate & Environment',
  'Human Rights': 'Human Rights',
  Education: 'Education',
  Privacy: 'Digital Privacy',
  Housing: 'Housing',
  Health: 'Health',
  Wildlife: 'Wildlife',
  Ocean: 'Ocean & Marine',
};

// Kept for the SDG badges that read a category's goal directly.
export const CATEGORY_SDG = Object.fromEntries(
  Object.entries(CATEGORY_STYLE).map(([key, c]) => [key, { goal: c.sdg.n, name: c.sdg.name, color: c.sdg.color }]),
);

export const URGENCY_COLOR = { low: '#94a3b8', medium: '#fbbf24', high: '#f97316', critical: '#ef4444' };

export const LEVELS = [
  { level: 1, name: 'Observer', min: 0, max: 5, color: '#94a3b8' },
  { level: 2, name: 'Supporter', min: 6, max: 20, color: '#60a5fa' },
  { level: 3, name: 'Advocate', min: 21, max: 50, color: '#a78bfa' },
  { level: 4, name: 'Changemaker', min: 51, max: 100, color: '#f472b6' },
  { level: 5, name: 'Catalyst', min: 101, max: 9999, color: '#fbbf24' },
];

// The design's daily challenge is five signatures.
export const DAILY_GOAL = 5;

// Contribution heatmap steps.
export const CONTRIB_STEPS = [
  'rgba(255,255,255,.05)',
  'rgba(78,222,163,.22)',
  'rgba(78,222,163,.45)',
  'rgba(78,222,163,.7)',
  'rgba(78,222,163,.95)',
];

export const RADII = { sm: 8, md: 16, lg: 24, xl: 32, full: 9999 };
export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.9,
    shadowRadius: 60,
    elevation: 22,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.5,
    shadowRadius: 36,
    elevation: 8,
  },
};

// The design's number formatter: 842000 -> "842k", 1000000 -> "1M".
export const fmt = (n) => (
  n >= 1e6
    ? `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`
    : n >= 1e3
      ? `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '')}k`
      : String(n)
);

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

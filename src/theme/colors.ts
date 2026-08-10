export type ThemeMode = 'dark' | 'light';

export interface ThemePalette {
  bg0: string;
  bg1: string;
  border: string;
  text: string;
  muted: string;
  dim: string;
}

export const THEMES: Record<ThemeMode, ThemePalette> = {
  dark: { bg0: '#05050F', bg1: '#0F0F23', border: '#1A1A3E', text: '#E8E8FF', muted: '#9A9AC0', dim: '#5A5A80' },
  light: { bg0: '#F2F1FA', bg1: '#FFFFFF', border: '#DEDBEF', text: '#181830', muted: '#5C5A80', dim: '#8C8AAE' },
};

// Fixed accent colors — identical in both themes, straight from the prototype.
export const ACCENT = {
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  cyan: '#00F5FF',
  amber: '#FBBF24',
  red: '#EF4444',
  green: '#22C55E',
  white: '#FFFFFF',
};

// Per-state colors (rarity, rank, category, difficulty) now live in
// ../state/stateConfig — that's the single source of truth for every
// fixed-vocabulary "state" the app renders.

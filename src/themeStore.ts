export type ThemeState = {
  wallpaper: string;
  iconTheme: 'default' | 'neon' | 'minimal' | 'glass';
  taskbarStyle: 'default' | 'mac' | 'top' | 'transparent';
  widgets: string[];
  windowStyle: 'default' | 'glass' | 'flat' | 'neon' | 'retro';
  accentColor: string;
  fontFamily: 'sans' | 'mono' | 'serif';
  cursorStyle: 'default' | 'crosshair' | 'terminal';
  animationSpeed: 'instant' | 'snappy' | 'smooth' | 'dreamy';
  soundPack: 'muted' | 'bubble' | 'synth' | 'retro';
  voiceEnabled: boolean;
  brightness: number; // 20 - 100
  nightLight: boolean;
  username: string;
  avatar: string;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  iconSize: 'small' | 'medium' | 'large';
};

const defaultState: ThemeState = {
  wallpaper: 'default',
  iconTheme: 'default',
  taskbarStyle: 'default',
  widgets: [],
  windowStyle: 'default',
  accentColor: '#8b5cf6', // violet-500
  fontFamily: 'sans',
  cursorStyle: 'default',
  animationSpeed: 'smooth',
  soundPack: 'bubble',
  voiceEnabled: false,
  brightness: 100,
  nightLight: false,
  username: 'VibeCoder',
  avatar: '🚀',
  wifiEnabled: true,
  bluetoothEnabled: true,
  iconSize: 'medium',
};

const SAVED_KEY = 'vibe_os_theme';

const getInitialState = (): ThemeState => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(SAVED_KEY) : null;
  if (saved) {
    try {
      return { ...defaultState, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Failed to load theme", e);
    }
  }
  return defaultState;
};

let state: ThemeState = getInitialState();
const listeners = new Set<() => void>();

export const themeStore = {
  get: () => state,
  set: (newState: Partial<ThemeState>) => {
    state = { ...state, ...newState };
    if (typeof window !== 'undefined') {
      localStorage.setItem(SAVED_KEY, JSON.stringify(state));
    }
    listeners.forEach(l => l());
  },
  reset: () => {
    state = { ...defaultState };
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAVED_KEY);
    }
    listeners.forEach(l => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => { listeners.delete(l); };
  }
};

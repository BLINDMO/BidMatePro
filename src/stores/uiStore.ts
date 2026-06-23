import { create } from 'zustand';
import { newId } from '../utils/ids';

type ToastType = 'success' | 'error' | 'info';
export type Theme = 'light' | 'dark';

const THEME_KEY = 'bidmate-theme';

export function getInitialTheme(): Theme {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'dark';
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_KEY, theme);
}

interface UIStore {
  toast: { message: string; type: ToastType; id: string } | null;
  theme: Theme;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  toast: null,
  theme: getInitialTheme(),
  showToast: (message, type = 'success') => set({ toast: { message, type, id: newId() } }),
  clearToast: () => set({ toast: null }),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}));

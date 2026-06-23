import { create } from 'zustand';
import { newId } from '../utils/ids';

type ToastType = 'success' | 'error' | 'info';

interface UIStore {
  toast: { message: string; type: ToastType; id: string } | null;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  toast: null,
  showToast: (message, type = 'success') =>
    set({ toast: { message, type, id: newId() } }),
  clearToast: () => set({ toast: null }),
}));

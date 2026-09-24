import { create } from 'zustand';

export interface ToastNotification {
  id: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'success';
  duration?: number;
}

interface ToastState {
  toasts: ToastNotification[];
  showToast: (message: string, type?: ToastNotification['type'], duration?: number) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message: string, type: ToastNotification['type'] = 'warning', duration: number = 4500) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }));
      }, duration);
    }
  },
  dismissToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));

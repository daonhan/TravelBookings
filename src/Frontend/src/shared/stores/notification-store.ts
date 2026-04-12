import { create } from 'zustand';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  action?: { label: string; href: string };
}

export interface NotificationState {
  unreadCount: number;
  drawerOpen: boolean;
  toasts: Toast[];
  incrementUnread: () => void;
  resetUnread: () => void;
  setUnreadCount: (count: number) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

let toastCounter = 0;

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  drawerOpen: false,
  toasts: [],

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  resetUnread: () => set({ unreadCount: 0 }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  openDrawer: () => set({ drawerOpen: true }),

  closeDrawer: () => set({ drawerOpen: false }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

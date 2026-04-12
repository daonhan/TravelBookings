import { create } from 'zustand';

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'high-contrast';
  globalSearchOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: UIState['theme']) => void;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  globalSearchOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => set({ theme }),

  openGlobalSearch: () => set({ globalSearchOpen: true }),

  closeGlobalSearch: () => set({ globalSearchOpen: false }),
}));

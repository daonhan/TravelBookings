import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../ui-store';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useUIStore.setState({
      sidebarOpen: true,
      theme: 'light',
      globalSearchOpen: false,
    });
  });

  describe('toggleSidebar', () => {
    it('closes sidebar when it is open', () => {
      expect(useUIStore.getState().sidebarOpen).toBe(true);
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it('opens sidebar when it is closed', () => {
      useUIStore.setState({ sidebarOpen: false });
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('toggles back and forth correctly', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('setSidebarOpen', () => {
    it('sets sidebar open state explicitly', () => {
      useUIStore.getState().setSidebarOpen(false);
      expect(useUIStore.getState().sidebarOpen).toBe(false);
      useUIStore.getState().setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('sets theme to dark', () => {
      useUIStore.getState().setTheme('dark');
      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('sets theme to high-contrast', () => {
      useUIStore.getState().setTheme('high-contrast');
      expect(useUIStore.getState().theme).toBe('high-contrast');
    });

    it('sets theme back to light', () => {
      useUIStore.getState().setTheme('dark');
      useUIStore.getState().setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
    });
  });

  describe('globalSearch', () => {
    it('openGlobalSearch sets globalSearchOpen to true', () => {
      expect(useUIStore.getState().globalSearchOpen).toBe(false);
      useUIStore.getState().openGlobalSearch();
      expect(useUIStore.getState().globalSearchOpen).toBe(true);
    });

    it('closeGlobalSearch sets globalSearchOpen to false', () => {
      useUIStore.getState().openGlobalSearch();
      expect(useUIStore.getState().globalSearchOpen).toBe(true);
      useUIStore.getState().closeGlobalSearch();
      expect(useUIStore.getState().globalSearchOpen).toBe(false);
    });

    it('opening global search when already open stays open', () => {
      useUIStore.getState().openGlobalSearch();
      useUIStore.getState().openGlobalSearch();
      expect(useUIStore.getState().globalSearchOpen).toBe(true);
    });
  });

  describe('default state', () => {
    it('has correct initial values', () => {
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
      expect(state.theme).toBe('light');
      expect(state.globalSearchOpen).toBe(false);
    });
  });
});

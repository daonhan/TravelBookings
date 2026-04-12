import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '../notification-store';

describe('useNotificationStore', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useNotificationStore.setState({
      unreadCount: 0,
      drawerOpen: false,
      toasts: [],
    });
  });

  describe('incrementUnread', () => {
    it('increments unread count by 1', () => {
      expect(useNotificationStore.getState().unreadCount).toBe(0);
      useNotificationStore.getState().incrementUnread();
      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it('increments multiple times', () => {
      useNotificationStore.getState().incrementUnread();
      useNotificationStore.getState().incrementUnread();
      useNotificationStore.getState().incrementUnread();
      expect(useNotificationStore.getState().unreadCount).toBe(3);
    });
  });

  describe('resetUnread', () => {
    it('resets unread count to 0', () => {
      useNotificationStore.getState().incrementUnread();
      useNotificationStore.getState().incrementUnread();
      expect(useNotificationStore.getState().unreadCount).toBe(2);

      useNotificationStore.getState().resetUnread();
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('is a no-op when already 0', () => {
      useNotificationStore.getState().resetUnread();
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe('setUnreadCount', () => {
    it('sets an arbitrary unread count', () => {
      useNotificationStore.getState().setUnreadCount(42);
      expect(useNotificationStore.getState().unreadCount).toBe(42);
    });
  });

  describe('addToast', () => {
    it('adds a toast with a unique ID', () => {
      useNotificationStore.getState().addToast({
        title: 'Success',
        variant: 'success',
      });

      const toasts = useNotificationStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.id).toBeDefined();
      expect(toasts[0]!.id).toMatch(/^toast-/);
      expect(toasts[0]!.title).toBe('Success');
      expect(toasts[0]!.variant).toBe('success');
    });

    it('creates unique IDs for multiple toasts', () => {
      useNotificationStore.getState().addToast({
        title: 'First',
        variant: 'info',
      });
      useNotificationStore.getState().addToast({
        title: 'Second',
        variant: 'warning',
      });

      const toasts = useNotificationStore.getState().toasts;
      expect(toasts).toHaveLength(2);
      expect(toasts[0]!.id).not.toBe(toasts[1]!.id);
    });

    it('preserves optional description and action', () => {
      useNotificationStore.getState().addToast({
        title: 'Error occurred',
        description: 'Please try again',
        variant: 'error',
        action: { label: 'Retry', href: '/retry' },
      });

      const toast = useNotificationStore.getState().toasts[0]!;
      expect(toast.description).toBe('Please try again');
      expect(toast.action).toEqual({ label: 'Retry', href: '/retry' });
    });

    it('appends toasts without removing existing ones', () => {
      useNotificationStore.getState().addToast({ title: 'A', variant: 'info' });
      useNotificationStore.getState().addToast({ title: 'B', variant: 'info' });
      useNotificationStore.getState().addToast({ title: 'C', variant: 'info' });

      const toasts = useNotificationStore.getState().toasts;
      expect(toasts).toHaveLength(3);
      expect(toasts.map((t) => t.title)).toEqual(['A', 'B', 'C']);
    });
  });

  describe('dismissToast', () => {
    it('removes a toast by ID', () => {
      useNotificationStore.getState().addToast({
        title: 'To be removed',
        variant: 'warning',
      });

      const toastId = useNotificationStore.getState().toasts[0]!.id;
      useNotificationStore.getState().dismissToast(toastId);

      expect(useNotificationStore.getState().toasts).toHaveLength(0);
    });

    it('only removes the targeted toast, leaving others intact', () => {
      useNotificationStore.getState().addToast({ title: 'Keep', variant: 'info' });
      useNotificationStore.getState().addToast({ title: 'Remove', variant: 'error' });
      useNotificationStore.getState().addToast({ title: 'Also keep', variant: 'success' });

      const toasts = useNotificationStore.getState().toasts;
      const removeId = toasts[1]!.id;

      useNotificationStore.getState().dismissToast(removeId);

      const remaining = useNotificationStore.getState().toasts;
      expect(remaining).toHaveLength(2);
      expect(remaining.map((t) => t.title)).toEqual(['Keep', 'Also keep']);
    });

    it('does nothing when dismissing a non-existent ID', () => {
      useNotificationStore.getState().addToast({ title: 'Stays', variant: 'info' });
      useNotificationStore.getState().dismissToast('non-existent-id');
      expect(useNotificationStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('drawer', () => {
    it('openDrawer sets drawerOpen to true', () => {
      useNotificationStore.getState().openDrawer();
      expect(useNotificationStore.getState().drawerOpen).toBe(true);
    });

    it('closeDrawer sets drawerOpen to false', () => {
      useNotificationStore.getState().openDrawer();
      useNotificationStore.getState().closeDrawer();
      expect(useNotificationStore.getState().drawerOpen).toBe(false);
    });
  });
});

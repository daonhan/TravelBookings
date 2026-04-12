import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Plane,
  Calendar,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/shared/auth';
import { useUIStore } from '@/shared/stores';
import { useMediaQuery } from '@/shared/hooks';
import { cn } from '@/shared/utils/cn';
import type { UserRole } from '@/shared/types';

/* -------------------------------------------------------------------------- */
/*  Navigation items definition                                               */
/* -------------------------------------------------------------------------- */

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Roles that can see this item. Empty array = visible to all. */
  requiredRoles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    requiredRoles: [],
  },
  {
    label: 'Bookings',
    href: '/bookings',
    icon: Plane,
    requiredRoles: [],
  },
  {
    label: 'Events',
    href: '/events',
    icon: Calendar,
    requiredRoles: [],
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: CreditCard,
    requiredRoles: ['FinanceAdmin', 'Admin'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    requiredRoles: ['Manager', 'Admin'],
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
    requiredRoles: [],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    requiredRoles: [],
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
  const { hasRole } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Auto-collapse on small screens
  const collapsed = !sidebarOpen;

  // Get current path to highlight active route
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  function isActive(href: string): boolean {
    if (href === '/') {
      return currentPath === '/' || currentPath === '';
    }
    return currentPath.startsWith(href);
  }

  function canAccess(item: NavItem): boolean {
    if (item.requiredRoles.length === 0) return true;
    return item.requiredRoles.some((role) => hasRole(role));
  }

  // On mobile, clicking a nav item collapses the sidebar
  function handleNavClick() {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col border-r border-gray-200 bg-white transition-all duration-200',
          // Desktop: collapsible between w-64 and w-16
          isDesktop && (collapsed ? 'w-16' : 'w-64'),
          // Mobile: slide in/out
          !isDesktop && (sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full'),
        )}
      >
        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4" aria-label="Main navigation">
          {NAV_ITEMS.filter(canAccess).map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-brand-50 font-bold text-brand-700'
                    : 'font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  collapsed && isDesktop && 'justify-center px-0',
                )}
                title={collapsed && isDesktop ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600',
                  )}
                />
                {(!collapsed || !isDesktop) && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        {isDesktop && (
          <div className="border-t border-gray-200 p-2">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex w-full items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft
                className={cn(
                  'h-5 w-5 transition-transform',
                  collapsed && 'rotate-180',
                )}
              />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

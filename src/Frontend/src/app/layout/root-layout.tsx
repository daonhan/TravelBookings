import { Outlet } from '@tanstack/react-router';
import { useUIStore } from '@/shared/stores';
import { useMediaQuery } from '@/shared/hooks';
import { cn } from '@/shared/utils/cn';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { GlobalSearch } from './global-search';

/* -------------------------------------------------------------------------- */
/*  Root Layout                                                               */
/*  Fixed Header at top (h-16), Sidebar on left, main content area.           */
/*  Responsive: sidebar collapses on screens < 1024px.                        */
/* -------------------------------------------------------------------------- */

export function RootLayout() {
  const { sidebarOpen } = useUIStore();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <GlobalSearch />

      <main
        className={cn(
          'pt-16 transition-all duration-200',
          // Desktop: offset main content based on sidebar width
          isDesktop && (sidebarOpen ? 'pl-64' : 'pl-16'),
          // Mobile: no left padding (sidebar overlays)
          !isDesktop && 'pl-0',
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

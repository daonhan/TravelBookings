import { RouterProvider } from '@tanstack/react-router';
import { AppProviders } from '@/app/providers/app-providers';
import { router } from '@/app/router';

// Side-effect: initialise i18n
import '@/shared/i18n';

/* -------------------------------------------------------------------------- */
/*  App                                                                       */
/*  Top-level component that composes providers and the router.               */
/* -------------------------------------------------------------------------- */

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

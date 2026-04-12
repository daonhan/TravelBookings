import { Link } from '@tanstack/react-router';

/* -------------------------------------------------------------------------- */
/*  404 Not Found Page                                                        */
/* -------------------------------------------------------------------------- */

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900">Page Not Found</h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        The page you are looking for does not exist or has been moved. Please check the URL
        or navigate back to the home page.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
      >
        Go Home
      </Link>
    </div>
  );
}

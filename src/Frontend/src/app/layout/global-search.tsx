import { useCallback, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, Plane, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useDebounce } from '@/shared/hooks';
import { useAuth } from '@/shared/auth';
import { useUIStore } from '@/shared/stores';
import { searchBookings } from '@/shared/api/bookings-api';
import { searchEvents } from '@/shared/api/events-api';
import { getPaymentsByUser } from '@/shared/api/payments-api';
import type { BookingDto, EventDto, PaymentDto } from '@/shared/types';
import { cn } from '@/shared/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Search result types                                                       */
/* -------------------------------------------------------------------------- */

interface SearchResultGroup {
  type: 'bookings' | 'events' | 'payments';
  label: string;
  icon: React.ReactNode;
  items: SearchResultItem[];
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function mapBookings(bookings: BookingDto[]): SearchResultItem[] {
  return bookings.map((b) => ({
    id: b.id,
    title: `Booking ${b.id.slice(0, 8)}`,
    subtitle: `${b.status} - ${b.currency} ${b.totalAmount.toFixed(2)}`,
    href: `/bookings/${b.id}`,
  }));
}

function mapEvents(events: EventDto[]): SearchResultItem[] {
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    subtitle: `${e.city}, ${e.country} - ${e.status}`,
    href: `/events/${e.id}`,
  }));
}

function mapPayments(payments: PaymentDto[]): SearchResultItem[] {
  return payments.map((p) => ({
    id: p.id,
    title: `Payment ${p.id.slice(0, 8)}`,
    subtitle: `${p.status} - ${p.currency} ${p.amount.toFixed(2)}`,
    href: `/payments/${p.id}`,
  }));
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function GlobalSearch() {
  const { globalSearchOpen, openGlobalSearch, closeGlobalSearch } = useUIStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultGroup[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  /* ---- Ctrl+K keyboard shortcut ---- */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (globalSearchOpen) {
          closeGlobalSearch();
        } else {
          openGlobalSearch();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen, openGlobalSearch, closeGlobalSearch]);

  /* ---- Search when debounced query changes ---- */
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;

    async function performSearch() {
      setIsSearching(true);

      try {
        const [bookingsResult, eventsResult, paymentsResult] = await Promise.allSettled([
          searchBookings({ destination: debouncedQuery, pageSize: 5 }),
          searchEvents({ title: debouncedQuery, pageSize: 5 }),
          user ? getPaymentsByUser(user.id, { pageSize: 5 }) : Promise.resolve({ items: [], totalCount: 0, page: 1, pageSize: 5, totalPages: 0 }),
        ]);

        if (cancelled) return;

        const groups: SearchResultGroup[] = [];

        if (bookingsResult.status === 'fulfilled' && bookingsResult.value.items.length > 0) {
          groups.push({
            type: 'bookings',
            label: 'Bookings',
            icon: <Plane className="h-4 w-4" />,
            items: mapBookings(bookingsResult.value.items),
          });
        }

        if (eventsResult.status === 'fulfilled' && eventsResult.value.items.length > 0) {
          groups.push({
            type: 'events',
            label: 'Events',
            icon: <Calendar className="h-4 w-4" />,
            items: mapEvents(eventsResult.value.items),
          });
        }

        if (paymentsResult.status === 'fulfilled' && paymentsResult.value.items.length > 0) {
          groups.push({
            type: 'payments',
            label: 'Payments',
            icon: <CreditCard className="h-4 w-4" />,
            items: mapPayments(paymentsResult.value.items),
          });
        }

        setResults(groups);
      } catch {
        // Silently handle errors; results stay empty
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }

    void performSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, user]);

  /* ---- Navigate to result ---- */
  const handleSelect = useCallback(
    (href: string) => {
      closeGlobalSearch();
      setQuery('');
      setResults([]);
      void navigate({ to: href });
    },
    [closeGlobalSearch, navigate],
  );

  /* ---- Reset state when modal closes ---- */
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeGlobalSearch();
        setQuery('');
        setResults([]);
      }
    },
    [closeGlobalSearch],
  );

  const hasResults = results.length > 0;
  const showEmpty = !isSearching && debouncedQuery.trim().length > 0 && !hasResults;

  return (
    <Dialog.Root open={globalSearchOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2',
            'rounded-xl border border-gray-200 bg-white shadow-2xl',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          )}
        >
          <Dialog.Title className="sr-only">Global Search</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search across bookings, events, and payments
          </Dialog.Description>

          {/* Search input */}
          <div className="flex items-center border-b border-gray-200 px-4">
            <Search className="h-5 w-5 shrink-0 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bookings, events, payments..."
              className="flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-gray-400"
              autoFocus
            />
            {isSearching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="ml-2 rounded-md p-1 text-gray-400 hover:text-gray-600"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[360px] overflow-y-auto p-2">
            {/* Loading state */}
            {isSearching && !hasResults && (
              <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {/* Empty state */}
            {showEmpty && (
              <div className="py-8 text-center text-sm text-gray-500">
                No results found for "{debouncedQuery}"
              </div>
            )}

            {/* Result groups */}
            {hasResults &&
              results.map((group) => (
                <div key={group.type} className="mb-2">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {group.icon}
                    {group.label}
                  </div>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.href)}
                      className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {item.subtitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}

            {/* Hint when empty input */}
            {!query.trim() && (
              <div className="py-8 text-center text-sm text-gray-400">
                Type to search across bookings, events, and payments
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-gray-200 px-4 py-2 text-xs text-gray-400">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px]">
              Esc
            </kbd>
            <span className="ml-1.5">to close</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import * as React from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';

/* -------------------------------------------------------------------------- */
/*  DataTable                                                                 */
/*  Generic, sortable data table with loading skeleton, empty state,          */
/*  and pagination.                                                           */
/* -------------------------------------------------------------------------- */

/* ----------------------------- Column types ------------------------------- */

interface DataTableColumn<T> {
  /** Unique key for the column (used for sorting). */
  key: string;
  /** Visible header text. */
  header: string;
  /** Custom cell renderer. Falls back to `String(row[key])`. */
  cell?: (row: T) => React.ReactNode;
  /** Whether this column supports client-side sorting. */
  sortable?: boolean;
  /** Extra Tailwind classes applied to both `<th>` and `<td>`. */
  className?: string;
}

interface DataTablePagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading: boolean;
  emptyMessage?: string;
  pagination?: DataTablePagination;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
}

/* ------------------------------- Sort state ------------------------------- */

type SortDirection = 'asc' | 'desc';

interface SortState {
  key: string;
  direction: SortDirection;
}

/* -------------------------------- Helpers --------------------------------- */

function defaultCellValue<T>(row: T, key: string): React.ReactNode {
  const value = (row as Record<string, unknown>)[key];
  if (value == null) return '';
  return String(value);
}

function sortData<T>(data: T[], sort: SortState | null): T[] {
  if (!sort) return data;

  return [...data].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sort.key];
    const bVal = (b as Record<string, unknown>)[sort.key];

    let comparison = 0;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else {
      comparison = String(aVal ?? '').localeCompare(String(bVal ?? ''));
    }

    return sort.direction === 'asc' ? comparison : -comparison;
  });
}

/* -------------------------------- Component ------------------------------- */

function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data available',
  pagination,
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<SortState | null>(null);

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = React.useMemo(() => sortData(data, sort), [data, sort]);

  /* ------ Loading skeleton ------ */
  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-gray-500',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={`skel-${rowIdx}`} className="border-b border-gray-100">
                {columns.map((col) => (
                  <td key={`skel-${rowIdx}-${col.key}`} className={cn('px-4 py-3', col.className)}>
                    <Skeleton variant="text" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ------ Empty state ------ */
  if (sortedData.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  /* ------ Table ------ */
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left font-medium text-gray-500',
                      col.sortable && 'cursor-pointer select-none hover:text-gray-700',
                      col.className,
                    )}
                    scope="col"
                    {...(col.sortable
                      ? {
                          onClick: () => handleSort(col.key),
                          onKeyDown: (e: React.KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSort(col.key);
                            }
                          },
                          tabIndex: 0,
                          role: 'columnheader',
                          'aria-sort': isSorted
                            ? sort.direction === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none',
                        }
                      : {})}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        <span className="inline-flex flex-col" aria-hidden="true">
                          <ChevronUp
                            className={cn(
                              'h-3 w-3 -mb-0.5',
                              isSorted && sort.direction === 'asc'
                                ? 'text-blue-600'
                                : 'text-gray-300',
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              'h-3 w-3 -mt-0.5',
                              isSorted && sort.direction === 'desc'
                                ? 'text-blue-600'
                                : 'text-gray-300',
                            )}
                          />
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => (
              <tr
                key={rowKey(row)}
                className={cn(
                  'border-b border-gray-100 transition-colors hover:bg-gray-50',
                  onRowClick && 'cursor-pointer',
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-gray-700', col.className)}>
                    {col.cell ? col.cell(row) : defaultCellValue(row, col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
            <span className="ml-2 text-gray-400">
              ({pagination.totalCount} total)
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className={cn(
                'inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm',
                'transition-colors hover:bg-gray-50',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className={cn(
                'inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm',
                'transition-colors hover:bg-gray-50',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Exports --------------------------------- */

export {
  DataTable,
  type DataTableProps,
  type DataTableColumn,
  type DataTablePagination,
};

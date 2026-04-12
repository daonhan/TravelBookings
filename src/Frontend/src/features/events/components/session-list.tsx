import { DataTable, type DataTableColumn } from '@/shared/ui/data-table';
import type { SessionDto } from '@/shared/types';
import { formatDateTime } from '@/shared/utils/date';

/* -------------------------------------------------------------------------- */
/*  SessionList                                                                */
/*  DataTable showing the sessions associated with an event.                   */
/* -------------------------------------------------------------------------- */

interface SessionListProps {
  sessions: SessionDto[];
}

const columns: DataTableColumn<SessionDto>[] = [
  {
    key: 'title',
    header: 'Title',
    sortable: true,
  },
  {
    key: 'speaker',
    header: 'Speaker',
    sortable: true,
  },
  {
    key: 'time',
    header: 'Time',
    cell: (row) => (
      <span>
        {formatDateTime(row.startTime)} &ndash; {formatDateTime(row.endTime)}
      </span>
    ),
  },
  {
    key: 'capacity',
    header: 'Capacity',
    sortable: true,
    className: 'text-right',
  },
];

/**
 * Renders a DataTable listing the sessions for an event with columns
 * for title, speaker, time range, and capacity.
 */
export function SessionList({ sessions }: SessionListProps) {
  return (
    <DataTable<SessionDto>
      columns={columns}
      data={sessions}
      isLoading={false}
      emptyMessage="No sessions scheduled"
      rowKey={(row) => row.id}
    />
  );
}

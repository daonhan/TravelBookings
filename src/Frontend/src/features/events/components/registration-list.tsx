import { DataTable, type DataTableColumn } from '@/shared/ui/data-table';
import { Badge } from '@/shared/ui';
import type { RegistrationDto, RegistrationStatus } from '@/shared/types';
import { formatDateTime } from '@/shared/utils/date';

/* -------------------------------------------------------------------------- */
/*  Registration status badge color mapping                                    */
/* -------------------------------------------------------------------------- */

const REGISTRATION_STATUS_COLOR: Record<
  RegistrationStatus,
  'default' | 'info' | 'success' | 'warning' | 'error'
> = {
  Pending: 'default',
  Confirmed: 'success',
  Cancelled: 'error',
  WaitListed: 'warning',
};

/* -------------------------------------------------------------------------- */
/*  RegistrationList                                                           */
/* -------------------------------------------------------------------------- */

interface RegistrationListProps {
  registrations: RegistrationDto[];
}

const columns: DataTableColumn<RegistrationDto>[] = [
  {
    key: 'attendeeName',
    header: 'Attendee',
    sortable: true,
  },
  {
    key: 'registrationType',
    header: 'Type',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => {
      const color =
        REGISTRATION_STATUS_COLOR[row.status as RegistrationStatus] ?? 'default';
      return (
        <Badge color={color} size="sm">
          {row.status}
        </Badge>
      );
    },
  },
  {
    key: 'registeredAt',
    header: 'Registered At',
    sortable: true,
    cell: (row) => <span>{formatDateTime(row.registeredAt)}</span>,
  },
];

/**
 * Renders a DataTable listing the registrations for an event with columns
 * for attendee name, registration type, status, and registration date.
 */
export function RegistrationList({ registrations }: RegistrationListProps) {
  return (
    <DataTable<RegistrationDto>
      columns={columns}
      data={registrations}
      isLoading={false}
      emptyMessage="No registrations yet"
      rowKey={(row) => row.id}
    />
  );
}

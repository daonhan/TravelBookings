import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/ui/card';
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from '@/shared/ui/modal';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatDate, formatDateTime } from '@/shared/utils/date';
import { formatCurrency } from '@/shared/utils/currency';
import { useBookingSagaStatus } from '@/features/bookings/hooks/use-booking-saga-status';
import { useCancelBooking } from '@/features/bookings/hooks/use-cancel-booking';
import { SagaTracker } from '@/features/bookings/components/saga-tracker';
import { BookingStatusBadge } from '@/features/bookings/components/booking-status-badge';
import type { ItineraryDto, PassengerDto, BookingStatus } from '@/shared/types';

/* -------------------------------------------------------------------------- */
/*  BookingDetailPage                                                         */
/*  Full detail view with saga tracker, overview, itineraries & passengers.   */
/* -------------------------------------------------------------------------- */

/** Statuses that allow the user to request cancellation. */
const CANCELLABLE_STATUSES: BookingStatus[] = [
  'Requested',
  'InventoryReserved',
  'PaymentProcessing',
  'Confirmed',
];

export function BookingDetailPage() {
  const { t } = useTranslation('bookings');
  const { bookingId } = useParams({ strict: false }) as { bookingId: string };
  const { booking, sagaState, isTransitioning, isLoading } =
    useBookingSagaStatus(bookingId);
  const cancelMutation = useCancelBooking();

  /* ---- cancel dialog ---- */
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const canCancel = booking
    ? CANCELLABLE_STATUSES.includes(booking.status)
    : false;

  function handleConfirmCancel() {
    if (!bookingId) return;
    cancelMutation.mutate(
      { id: bookingId, reason: cancelReason },
      {
        onSettled: () => {
          setCancelOpen(false);
          setCancelReason('');
        },
      },
    );
  }

  /* ---- itinerary columns ---- */
  const itineraryColumns: DataTableColumn<ItineraryDto>[] = [
    {
      key: 'origin',
      header: t('detail.itineraries.origin', { defaultValue: 'Origin' }),
    },
    {
      key: 'destination',
      header: t('detail.itineraries.destination', { defaultValue: 'Destination' }),
    },
    {
      key: 'travelClass',
      header: t('detail.itineraries.travelClass', { defaultValue: 'Class' }),
      cell: (row) =>
        row.travelClass.charAt(0).toUpperCase() + row.travelClass.slice(1),
    },
    {
      key: 'departureDate',
      header: t('detail.itineraries.departureDate', { defaultValue: 'Departure' }),
      cell: (row) => formatDate(row.departureDate),
    },
    {
      key: 'returnDate',
      header: t('detail.itineraries.returnDate', { defaultValue: 'Return' }),
      cell: (row) => formatDate(row.returnDate),
    },
  ];

  /* ---- passenger columns ---- */
  const passengerColumns: DataTableColumn<PassengerDto>[] = [
    {
      key: 'firstName',
      header: t('detail.passengers.firstName', { defaultValue: 'First Name' }),
    },
    {
      key: 'lastName',
      header: t('detail.passengers.lastName', { defaultValue: 'Last Name' }),
    },
    {
      key: 'dateOfBirth',
      header: t('detail.passengers.dateOfBirth', { defaultValue: 'Date of Birth' }),
      cell: (row) => formatDate(row.dateOfBirth),
    },
  ];

  /* ---- loading skeleton ---- */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="heading" />
        <Skeleton variant="rectangle" height={80} />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="rectangle" height={200} />
          <Skeleton variant="rectangle" height={200} />
        </div>
        <Skeleton variant="rectangle" height={200} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">
          {t('detail.notFound', { defaultValue: 'Booking not found.' })}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t('detail.title', {
          defaultValue: `Booking ${bookingId.slice(0, 8)}`,
          id: bookingId.slice(0, 8),
        })}
        breadcrumbs={[
          { label: t('breadcrumbs.home', { defaultValue: 'Home' }), href: '/' },
          { label: t('breadcrumbs.bookings', { defaultValue: 'Bookings' }), href: '/bookings' },
          { label: bookingId.slice(0, 8) },
        ]}
        actions={
          canCancel ? (
            <Button
              variant="destructive"
              onClick={() => setCancelOpen(true)}
              loading={cancelMutation.isPending}
            >
              {t('detail.cancelBooking', { defaultValue: 'Cancel Booking' })}
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-6">
        {/* 1. Saga Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('detail.sagaStatus', { defaultValue: 'Booking Progress' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SagaTracker
              status={sagaState}
              createdAt={booking.createdAt}
              confirmedAt={booking.confirmedAt}
            />
            {isTransitioning && (
              <p className="mt-3 text-sm text-blue-600 animate-pulse">
                {t('detail.updating', {
                  defaultValue: 'Updating booking status...',
                })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Circuit breaker provisional state message */}
        {sagaState === 'PaymentProcessing' && (
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {t('detail.paymentProcessingNote', {
                defaultValue:
                  'Payment is being processed through the legacy gateway. ' +
                  'This may take a few moments. The circuit breaker is monitoring gateway health.',
              })}
            </span>
          </div>
        )}

        {/* 2. Booking Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('detail.overview', { defaultValue: 'Booking Overview' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('detail.status', { defaultValue: 'Status' })}
                </dt>
                <dd className="mt-1">
                  <BookingStatusBadge status={booking.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('detail.totalAmount', { defaultValue: 'Total Amount' })}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(booking.totalAmount, booking.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('detail.currency', { defaultValue: 'Currency' })}
                </dt>
                <dd className="mt-1 text-sm text-gray-700">{booking.currency}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('detail.paymentReference', { defaultValue: 'Payment Reference' })}
                </dt>
                <dd className="mt-1 font-mono text-sm text-gray-700">
                  {booking.paymentReference || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('detail.createdAt', { defaultValue: 'Created' })}
                </dt>
                <dd className="mt-1 text-sm text-gray-700">
                  {formatDateTime(booking.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  {t('detail.confirmedAt', { defaultValue: 'Confirmed' })}
                </dt>
                <dd className="mt-1 text-sm text-gray-700">
                  {formatDateTime(booking.confirmedAt)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* 3. Itineraries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('detail.itineraries.title', { defaultValue: 'Itineraries' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<ItineraryDto>
              columns={itineraryColumns}
              data={booking.itineraries}
              isLoading={false}
              rowKey={(row) => row.id}
              emptyMessage={t('detail.itineraries.empty', {
                defaultValue: 'No itineraries.',
              })}
            />
          </CardContent>
        </Card>

        {/* 4. Passengers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('detail.passengers.title', { defaultValue: 'Passengers' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<PassengerDto>
              columns={passengerColumns}
              data={booking.passengers}
              isLoading={false}
              rowKey={(row) => row.id}
              emptyMessage={t('detail.passengers.empty', {
                defaultValue: 'No passengers.',
              })}
            />
          </CardContent>
        </Card>
      </div>

      {/* Cancel Dialog with Reason Input */}
      <Modal open={cancelOpen} onOpenChange={setCancelOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {t('detail.cancelDialog.title', { defaultValue: 'Cancel Booking' })}
            </ModalTitle>
            <ModalDescription>
              {t('detail.cancelDialog.description', {
                defaultValue:
                  'Are you sure you want to cancel this booking? This will trigger compensation steps to reverse any reserved inventory and payments.',
              })}
            </ModalDescription>
          </ModalHeader>

          <div className="mt-4">
            <Input
              label={t('detail.cancelDialog.reasonLabel', {
                defaultValue: 'Cancellation Reason',
              })}
              placeholder={t('detail.cancelDialog.reasonPlaceholder', {
                defaultValue: 'Why are you cancelling this booking?',
              })}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">
                {t('detail.cancelDialog.cancel', { defaultValue: 'Keep Booking' })}
              </Button>
            </ModalClose>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              loading={cancelMutation.isPending}
              disabled={!cancelReason.trim()}
            >
              {t('detail.cancelDialog.confirm', {
                defaultValue: 'Yes, Cancel Booking',
              })}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

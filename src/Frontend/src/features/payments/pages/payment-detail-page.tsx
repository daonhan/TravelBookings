import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { CreditCard, Link2, RotateCcw } from 'lucide-react';
import {
  PageHeader,
  Button,
  Skeleton,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/ui';
import { useAuth } from '@/shared/auth';
import { useSignalREvent } from '@/shared/realtime/use-signalr-event';
import { paymentKeys } from '@/shared/api';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDateTime } from '@/shared/utils/date';
import type {
  PaymentProcessedEvent,
  PaymentFailedEvent,
} from '@/shared/types';
import { usePaymentDetail } from '../hooks/use-payment-detail';
import { PaymentStatusBadge } from '../components/payment-status-badge';
import { PaymentTimeline } from '../components/payment-timeline';
import { RefundForm } from '../components/refund-form';

/* -------------------------------------------------------------------------- */
/*  Route type helper                                                          */
/* -------------------------------------------------------------------------- */

interface RouteParams {
  paymentId: string;
}

export interface PaymentDetailPageProps {
  /** When using code-based routing, pass params directly. */
  params?: RouteParams;
}

/* -------------------------------------------------------------------------- */
/*  PaymentDetailPage                                                          */
/* -------------------------------------------------------------------------- */

export function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  const { t } = useTranslation('payments');
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const paymentId = params?.paymentId ?? '';
  const isFinanceAdmin = hasRole('FinanceAdmin');

  const { data: payment, isLoading, isError } = usePaymentDetail(paymentId);

  /* ----- SignalR real-time status updates ----- */
  useSignalREvent<PaymentProcessedEvent>('PaymentProcessed', (event) => {
    if (event.paymentId === paymentId) {
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(paymentId) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    }
  });

  useSignalREvent<PaymentFailedEvent>('PaymentFailed', (event) => {
    if (event.paymentId === paymentId) {
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(paymentId) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    }
  });

  /* ----- Refund dialog ----- */
  const [refundOpen, setRefundOpen] = useState(false);

  const canRefund =
    isFinanceAdmin &&
    payment != null &&
    (payment.status === 'Completed' || payment.status === 'PartiallyRefunded');

  // Calculate the remaining refundable amount by subtracting any previous refunds
  const refundedAmount =
    payment?.transactions
      .filter((txn) => txn.type === 'REFUND')
      .reduce((sum, txn) => sum + txn.amount, 0) ?? 0;

  const maxRefundable = payment ? payment.amount - refundedAmount : 0;

  const handleOpenRefund = useCallback(() => {
    setRefundOpen(true);
  }, []);

  /* ----- Loading skeleton ----- */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="heading" />
        <Skeleton variant="rectangle" height={200} />
        <Skeleton variant="rectangle" height={120} />
        <Skeleton variant="rectangle" height={200} />
      </div>
    );
  }

  /* ----- Error / not found ----- */
  if (isError || !payment) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">
          {t('detail.notFound', 'Payment not found or an error occurred.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={t('detail.title', 'Payment Detail')}
        breadcrumbs={[
          { label: t('breadcrumb.home', 'Home'), href: '/' },
          { label: t('breadcrumb.payments', 'Payments'), href: '/payments' },
          { label: payment.id.slice(0, 8) },
        ]}
        actions={
          canRefund ? (
            <Button variant="destructive" onClick={handleOpenRefund}>
              <RotateCcw className="h-4 w-4" />
              {t('detail.refund', 'Refund')}
            </Button>
          ) : undefined
        }
      />

      {/* ---- Section 1: Overview ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg">
              {t('detail.overview', 'Overview')}
            </CardTitle>
            <PaymentStatusBadge status={payment.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount (large) */}
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-gray-400" aria-hidden="true" />
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(payment.amount, payment.currency)}
            </span>
            <span className="text-sm text-gray-500 uppercase">
              {payment.currency}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                {t('detail.method', 'Payment Method')}
              </p>
              <p className="mt-0.5 text-sm text-gray-900">{payment.method}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                {t('detail.gatewayId', 'Gateway Transaction ID')}
              </p>
              <p className="mt-0.5 font-mono text-sm text-gray-900">
                {payment.gatewayTransactionId}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                {t('detail.createdAt', 'Created')}
              </p>
              <p className="mt-0.5 text-sm text-gray-900">
                {formatDateTime(payment.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                {t('detail.processedAt', 'Processed')}
              </p>
              <p className="mt-0.5 text-sm text-gray-900">
                {formatDateTime(payment.processedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Section 2: Associated Booking ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('detail.associatedBooking', 'Associated Booking')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline focus:outline-none focus:underline"
            onClick={() =>
              navigate({
                to: '/bookings/$bookingId',
                params: { bookingId: payment.bookingId },
              })
            }
          >
            <Link2 className="h-4 w-4" aria-hidden="true" />
            {t('detail.viewBooking', 'View Booking')}{' '}
            <span className="font-mono">{payment.bookingId.slice(0, 8)}</span>
          </button>
        </CardContent>
      </Card>

      {/* ---- Section 3: Transaction Timeline ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('detail.transactions', 'Transactions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentTimeline transactions={payment.transactions} />
        </CardContent>
      </Card>

      {/* Refund modal */}
      {canRefund && (
        <RefundForm
          paymentId={payment.id}
          maxAmount={maxRefundable}
          open={refundOpen}
          onOpenChange={setRefundOpen}
        />
      )}
    </div>
  );
}

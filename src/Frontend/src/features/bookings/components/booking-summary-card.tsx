import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { formatDate } from '@/shared/utils/date';
import { formatCurrency } from '@/shared/utils/currency';
import { BookingStatusBadge } from './booking-status-badge';
import type { BookingDto } from '@/shared/types';

/* -------------------------------------------------------------------------- */
/*  BookingSummaryCard                                                        */
/*  Compact card used in search results and dashboard widgets.                */
/* -------------------------------------------------------------------------- */

interface BookingSummaryCardProps {
  booking: BookingDto;
}

export function BookingSummaryCard({ booking }: BookingSummaryCardProps) {
  const { t } = useTranslation('bookings');

  const firstItinerary = booking.itineraries[0];
  const destination = firstItinerary?.destination ?? '-';
  const departureDate = firstItinerary?.departureDate;
  const returnDate = firstItinerary?.returnDate;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-4">
        {/* Top row: status + booking ID */}
        <div className="flex items-center justify-between">
          <BookingStatusBadge status={booking.status} />
          <span className="font-mono text-xs text-gray-400">
            {booking.id.slice(0, 8)}
          </span>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <MapPin className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          <span className="font-medium">{destination}</span>
        </div>

        {/* Travel dates */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          <span>
            {formatDate(departureDate)}
            {returnDate && ` - ${formatDate(returnDate)}`}
          </span>
        </div>

        {/* Bottom row: amount + passenger count */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
            <DollarSign className="h-4 w-4 text-gray-400" aria-hidden="true" />
            {formatCurrency(booking.totalAmount, booking.currency)}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
            <span>
              {booking.passengers.length}{' '}
              {t('summary.passengers', {
                defaultValue: 'passenger(s)',
                count: booking.passengers.length,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

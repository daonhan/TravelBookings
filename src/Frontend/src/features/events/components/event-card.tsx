import { MapPin, Calendar } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
} from '@/shared/ui';
import type { EventDto, EventStatus } from '@/shared/types';
import { formatDateRange } from '@/shared/utils/date';
import { CapacityGauge } from './capacity-gauge';

/* -------------------------------------------------------------------------- */
/*  Status badge color mapping                                                 */
/* -------------------------------------------------------------------------- */

const STATUS_COLOR: Record<EventStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  Draft: 'default',
  Published: 'info',
  InProgress: 'warning',
  Completed: 'success',
  Cancelled: 'error',
};

/* -------------------------------------------------------------------------- */
/*  EventCard                                                                  */
/* -------------------------------------------------------------------------- */

interface EventCardProps {
  event: EventDto;
  onClick?: () => void;
}

/**
 * Card view of an event. Displays the title, venue and city, date range,
 * capacity gauge, and a status badge.
 */
export function EventCard({ event, onClick }: EventCardProps) {
  const used = event.capacity - event.availableCapacity;

  return (
    <Card
      className={onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <Badge color={STATUS_COLOR[event.status]} size="sm">
            {event.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Venue + City */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          <span>
            {event.venue}, {event.city}
          </span>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          <span>{formatDateRange(event.startDate, event.endDate)}</span>
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full">
          <CapacityGauge capacity={event.capacity} used={used} />
        </div>
      </CardFooter>
    </Card>
  );
}

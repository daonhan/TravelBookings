import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

/* -------------------------------------------------------------------------- */
/*  DatePicker                                                                */
/*  Popover-based date picker with month/year navigation and a day grid.      */
/*  Uses @radix-ui/react-popover + date-fns.                                  */
/* -------------------------------------------------------------------------- */

interface DatePickerProps {
  /** Visible label rendered above the trigger. */
  label?: string;
  /** Currently selected ISO date string (yyyy-MM-dd). */
  value?: string;
  /** Called with the selected ISO date string. */
  onChange: (date: string) => void;
  /** Validation error message. */
  error?: string;
  /** Placeholder text when no date is selected. */
  placeholder?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

function DatePicker({
  label,
  value,
  onChange,
  error,
  placeholder = 'Select date',
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // The month currently displayed in the calendar
  const [viewDate, setViewDate] = React.useState<Date>(() =>
    value ? parseISO(value) : new Date(),
  );

  // Parsed selected date (or null)
  const selectedDate = React.useMemo(
    () => (value ? parseISO(value) : null),
    [value],
  );

  // Sync view when value changes externally
  React.useEffect(() => {
    if (value) {
      setViewDate(parseISO(value));
    }
  }, [value]);

  /* ---------- Calendar grid ---------- */

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  /* ---------- Handlers ---------- */

  const handleSelect = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, day: Date) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(day);
    }
  };

  const id = React.useId();
  const triggerId = `${id}-trigger`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={triggerId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            id={triggerId}
            type="button"
            className={cn(
              'inline-flex h-10 w-full items-center gap-2 rounded-md border bg-white px-3 text-sm shadow-sm',
              'transition-colors hover:bg-gray-50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              error ? 'border-red-500' : 'border-gray-300',
            )}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-describedby={error ? errorId : undefined}
          >
            <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
            <span className={cn('flex-1 text-left', !value && 'text-gray-400')}>
              {selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}
            </span>
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            sideOffset={4}
            align="start"
            className={cn(
              'z-50 rounded-lg border border-gray-200 bg-white p-3 shadow-lg',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            )}
          >
            {/* Month / year navigation */}
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewDate((d) => subMonths(d, 1))}
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-md',
                  'transition-colors hover:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                )}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm font-medium text-gray-900">
                {format(viewDate, 'MMMM yyyy')}
              </span>

              <button
                type="button"
                onClick={() => setViewDate((d) => addMonths(d, 1))}
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-md',
                  'transition-colors hover:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                )}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-0" role="row">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="flex h-8 w-8 items-center justify-center text-xs font-medium text-gray-500"
                  role="columnheader"
                  aria-label={day}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div
              className="grid grid-cols-7 gap-0"
              role="grid"
              aria-label={format(viewDate, 'MMMM yyyy')}
            >
              {calendarDays.map((day) => {
                const inMonth = isSameMonth(day, viewDate);
                const selected = selectedDate ? isSameDay(day, selectedDate) : false;
                const today = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    tabIndex={inMonth ? 0 : -1}
                    onClick={() => handleSelect(day)}
                    onKeyDown={(e) => handleKeyDown(e, day)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500',
                      !inMonth && 'text-gray-300',
                      inMonth && !selected && 'text-gray-700 hover:bg-gray-100',
                      today && !selected && 'font-semibold text-blue-600',
                      selected && 'bg-blue-600 text-white hover:bg-blue-700',
                    )}
                    aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                    aria-selected={selected}
                    aria-current={today ? 'date' : undefined}
                    role="gridcell"
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------- Exports --------------------------------- */

export { DatePicker, type DatePickerProps };

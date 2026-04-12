import { useFormContext } from 'react-hook-form';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { DatePicker } from '@/shared/ui/date-picker';
import { Button } from '@/shared/ui/button';
import type { CreateBookingInput } from '@/shared/validation/booking-schemas';

/* -------------------------------------------------------------------------- */
/*  ItineraryFormRow                                                          */
/*  Single row in the dynamic itineraries field array.                        */
/* -------------------------------------------------------------------------- */

interface ItineraryFormRowProps {
  index: number;
  onRemove: () => void;
  showRemove: boolean;
}

const TRAVEL_CLASS_OPTIONS = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
];

export function ItineraryFormRow({ index, onRemove, showRemove }: ItineraryFormRowProps) {
  const { t } = useTranslation('bookings');
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateBookingInput>();

  const prefix = `itineraries.${index}` as const;
  const fieldErrors = errors.itineraries?.[index];

  return (
    <div className="relative grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Row header */}
      <div className="col-span-full flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {t('createBooking.itinerary', { defaultValue: 'Leg' })} {index + 1}
        </span>
        {showRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label={t('createBooking.removeItinerary', {
              defaultValue: `Remove leg ${index + 1}`,
              index: index + 1,
            })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Origin */}
      <Input
        label={t('createBooking.origin', { defaultValue: 'Origin' })}
        placeholder="e.g. SYD"
        error={fieldErrors?.origin?.message}
        {...register(`${prefix}.origin`)}
      />

      {/* Destination */}
      <Input
        label={t('createBooking.destination', { defaultValue: 'Destination' })}
        placeholder="e.g. LAX"
        error={fieldErrors?.destination?.message}
        {...register(`${prefix}.destination`)}
      />

      {/* Travel Class */}
      <Select
        label={t('createBooking.travelClass', { defaultValue: 'Travel Class' })}
        options={TRAVEL_CLASS_OPTIONS}
        value={watch(`${prefix}.travelClass`) ?? 'economy'}
        onValueChange={(val) => setValue(`${prefix}.travelClass`, val)}
        error={fieldErrors?.travelClass?.message}
      />

      {/* Departure Date */}
      <DatePicker
        label={t('createBooking.departureDate', { defaultValue: 'Departure Date' })}
        value={watch(`${prefix}.departureDate`) ?? ''}
        onChange={(val) => setValue(`${prefix}.departureDate`, val, { shouldValidate: true })}
        error={fieldErrors?.departureDate?.message}
      />

      {/* Return Date (optional) */}
      <DatePicker
        label={t('createBooking.returnDate', { defaultValue: 'Return Date (optional)' })}
        value={watch(`${prefix}.returnDate`) ?? ''}
        onChange={(val) => setValue(`${prefix}.returnDate`, val, { shouldValidate: true })}
        error={fieldErrors?.returnDate?.message}
      />
    </div>
  );
}
